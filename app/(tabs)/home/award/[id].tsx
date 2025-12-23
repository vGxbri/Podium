import { useFocusEffect } from "@react-navigation/native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import {
    ActivityIndicator,
    Button,
    Card,
    Chip,
    Surface,
    Text,
    TextInput,
    useTheme,
} from "react-native-paper";
import { MemberAvatar } from "../../../../components/MemberAvatar";
import { theme as appTheme } from "../../../../constants/theme";
import { useGroup } from "../../../../hooks";
import { awardsService } from "../../../../services";
import { AwardWithNominees } from "../../../../types/database";

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleString("es-ES", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AwardDetailScreen() {
  const { id, groupId } = useLocalSearchParams<{ id: string; groupId: string }>();
  const router = useRouter();
  const theme = useTheme();
  
  const { isAdmin } = useGroup(groupId);
  
  const [award, setAward] = useState<AwardWithNominees | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [myVote, setMyVote] = useState<string | null>(null);
  
  const [showStartVotingModal, setShowStartVotingModal] = useState(false);
  const [deadlineMode, setDeadlineMode] = useState<'24h' | '48h' | '1w' | 'custom'>('24h');
  const [customDate, setCustomDate] = useState("");
  const [customTime, setCustomTime] = useState("");

  const fetchAward = React.useCallback(async () => {
    try {
      const data = await awardsService.getAwardById(id);
      setAward(data);
      
      if (data && data.status === 'voting') {
        const vote = await awardsService.getMyVote(id);
        setMyVote(vote);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo cargar el premio");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchAward();
    }, [fetchAward])
  );

  const handleStartVoting = async () => {
    if (!award) return;

    let deadlineDate: Date | undefined;
    
    try {
      if (deadlineMode === '24h') {
        deadlineDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      } else if (deadlineMode === '48h') {
        deadlineDate = new Date(Date.now() + 48 * 60 * 60 * 1000);
      } else if (deadlineMode === '1w') {
        deadlineDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      } else if (deadlineMode === 'custom') {
        const [datePart, timePart] = [customDate, customTime];
        const [day, month, year] = datePart.split('/').map(Number);
        const [hour, minute] = timePart.split(':').map(Number);
        
        if (!day || !month || !year || isNaN(hour) || isNaN(minute)) {
          Alert.alert("Error", "Formato de fecha inválido. Usa DD/MM/YYYY y HH:MM");
          return;
        }
        
        deadlineDate = new Date(year, month - 1, day, hour, minute);
        
        if (deadlineDate <= new Date()) {
          Alert.alert("Error", "La fecha debe ser futura");
          return;
        }
      }

      setActionLoading(true);
      await awardsService.updateAwardStatus(award.id, 'voting', deadlineDate?.toISOString());
      
      setShowStartVotingModal(false);
      fetchAward();
      
    } catch {
      Alert.alert("Error", "No se pudo iniciar la votación");
    } finally {
      setActionLoading(false);
    }
  };

  const handleVote = async (nomineeId: string) => {
    if (!award) return;
    
    try {
      setActionLoading(true);
      await awardsService.vote(award.id, nomineeId);
      setMyVote(nomineeId);
      Alert.alert("Éxito", "Tu voto ha sido registrado");
      fetchAward();
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo registrar el voto");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFinishVoting = async () => {
    if (!award) return;
    
    Alert.alert(
      "Finalizar Votación",
      "¿Estás seguro? Se cerrará la votación y se decidirá el ganador.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Finalizar",
          style: "destructive",
          onPress: async () => {
            try {
              setActionLoading(true);
              await awardsService.declareWinner(award.id);
              fetchAward();
            } catch (error: any) {
              Alert.alert("Error", error.message || "Error al finalizar");
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleRevealWinner = async () => {
    if (!award) return;

    Alert.alert(
      "Revelar Ganador",
      "¿Quieres mostrar el ganador a todos los miembros?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Revelar",
          onPress: async () => {
             try {
               setActionLoading(true);
               await awardsService.revealWinner(award.id);
               fetchAward();
             } catch {
               Alert.alert("Error", "No se pudo revelar el ganador");
             } finally {
               setActionLoading(false);
             }
          }
        }
      ]
    );
  };

  const handleDelete = async () => {
    if (!award) return;

    Alert.alert(
      "Eliminar Premio",
      "¿Estás seguro? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              setActionLoading(true);
              await awardsService.deleteAward(award.id);
              router.back();
            } catch {
              Alert.alert("Error", "No se pudo eliminar");
            }
          }
        }
      ]
    );
  };
  
  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!award) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <Text variant="bodyLarge">Premio no encontrado</Text>
      </View>
    );
  }

  const getStatusConfig = () => {
    switch (award.status) {
      case 'voting':
        return { label: 'Votación en curso', color: '#F59E0B', bg: 'rgba(255, 159, 10, 0.15)' };
      case 'completed':
        return { label: 'Finalizado', color: theme.colors.primary, bg: 'rgba(50, 215, 75, 0.15)' };
      default:
        return { label: 'Borrador', color: theme.colors.onSurfaceVariant, bg: theme.colors.surfaceVariant };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <>
      <Stack.Screen options={{ title: "Detalles del Premio" }} />
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <Surface style={[styles.header, { backgroundColor: theme.colors.surfaceVariant }]} elevation={0}>
          <Surface style={[styles.iconContainer, { backgroundColor: theme.colors.surface }]} elevation={2}>
            <Text style={styles.icon}>{award.icon}</Text>
          </Surface>
          <Text variant="headlineSmall" style={{ fontWeight: "bold", textAlign: "center", marginBottom: 8 }}>
            {award.name}
          </Text>
          {award.description && (
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: "center", marginBottom: 12 }}>
              {award.description}
            </Text>
          )}
          
          <Chip style={{ backgroundColor: statusConfig.bg }}>
            <Text style={{ color: statusConfig.color, fontWeight: "600" }}>{statusConfig.label}</Text>
          </Chip>

          {award.status === 'voting' && award.voting_ends_at && (
            <Text variant="labelMedium" style={{ color: theme.colors.error, marginTop: 8 }}>
              Termina: {formatDate(award.voting_ends_at)}
            </Text>
          )}

          {award.status === 'completed' && (
            <Text variant="bodyMedium" style={{ color: theme.colors.primary, fontWeight: "600", marginTop: 8 }}>
              {award.is_revealed ? "¡Ganador revelado!" : "Ganador pendiente de revelar."}
            </Text>
          )}
        </Surface>

        {/* Nominees Section */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={{ fontWeight: "600", marginBottom: 12 }}>
            Nominados ({award.nominees.length})
          </Text>
          
          <View style={styles.nomineesList}>
            {award.nominees.map((nominee) => (
              <Card key={nominee.id} mode="outlined" style={styles.nomineeCard}>
                <Card.Content style={styles.nomineeRow}>
                  <MemberAvatar user={nominee.user} size="md" />
                  <View style={styles.nomineeInfo}>
                    <Text variant="bodyLarge" style={{ fontWeight: "500" }}>
                      {nominee.user.display_name}
                    </Text>
                    {award.status === 'completed' && nominee.is_winner && award.is_revealed && (
                      <Chip compact style={{ backgroundColor: '#FFD700', marginTop: 4 }}>
                        <Text style={{ fontSize: 11 }}>🏆 Ganador</Text>
                      </Chip>
                    )}
                  </View>
                  
                  {award.status === 'voting' && (
                    <Button
                      mode={myVote === nominee.id ? "contained" : "outlined"}
                      compact
                      disabled={!!myVote || actionLoading}
                      onPress={() => handleVote(nominee.id)}
                    >
                      {myVote === nominee.id ? "Votado" : "Votar"}
                    </Button>
                  )}
                </Card.Content>
              </Card>
            ))}
          </View>
        </View>

        {/* Admin Actions */}
        {isAdmin && (
          <Card mode="outlined" style={styles.adminSection}>
            <Card.Content>
              <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 12, textTransform: "uppercase" }}>
                Administración
              </Text>
              
              {award.status === 'draft' && (
                <Button mode="contained" onPress={() => setShowStartVotingModal(true)} loading={actionLoading}>
                  Iniciar Votación
                </Button>
              )}
              
              {award.status === 'voting' && (
                <Button mode="outlined" onPress={handleFinishVoting} loading={actionLoading} style={{ marginBottom: 10 }}>
                  Finalizar Votación Ahora
                </Button>
              )}

              {award.status === 'completed' && !award.is_revealed && (
                <Button mode="contained" onPress={handleRevealWinner} loading={actionLoading} style={{ marginBottom: 10 }}>
                  Revelar Ganador
                </Button>
              )}
              
              <Button 
                mode="text" 
                onPress={handleDelete} 
                textColor={theme.colors.error}
                style={{ marginTop: 10 }}
              >
                Eliminar Premio
              </Button>
            </Card.Content>
          </Card>
        )}
        
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Start Voting Modal */}
      <Modal
        visible={showStartVotingModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStartVotingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Card style={styles.modalContent}>
            <Card.Content>
              <Text variant="titleLarge" style={{ textAlign: "center", marginBottom: 8 }}>
                Configurar Votación
              </Text>
              <Text variant="bodyMedium" style={{ textAlign: "center", color: theme.colors.onSurfaceVariant, marginBottom: 16 }}>
                Elige cuándo termina la votación:
              </Text>
              
              <View style={styles.optionsContainer}>
                {(['24h', '48h', '1w', 'custom'] as const).map((mode) => (
                  <TouchableOpacity
                    key={mode}
                    style={[
                      styles.optionButton,
                      { 
                        borderColor: deadlineMode === mode ? theme.colors.primary : theme.colors.outline,
                        backgroundColor: deadlineMode === mode ? theme.colors.primaryContainer : 'transparent'
                      }
                    ]}
                    onPress={() => setDeadlineMode(mode)}
                  >
                    <Text style={{ color: deadlineMode === mode ? theme.colors.primary : theme.colors.onSurface, fontWeight: "500" }}>
                      {mode === '24h' && '24 Horas'}
                      {mode === '48h' && '48 Horas'}
                      {mode === '1w' && '1 Semana'}
                      {mode === 'custom' && 'Personalizado'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {deadlineMode === 'custom' && (
                <View style={styles.customDateContainer}>
                  <TextInput
                    label="DD/MM/YYYY"
                    mode="outlined"
                    value={customDate}
                    onChangeText={setCustomDate}
                    style={{ flex: 1, marginRight: 8 }}
                  />
                  <TextInput
                    label="HH:MM"
                    mode="outlined"
                    value={customTime}
                    onChangeText={setCustomTime}
                    style={{ flex: 1 }}
                  />
                </View>
              )}

              <View style={styles.modalActions}>
                <Button mode="text" onPress={() => setShowStartVotingModal(false)} style={{ flex: 1, marginRight: 8 }}>
                  Cancelar
                </Button>
                <Button mode="contained" onPress={handleStartVoting} style={{ flex: 1, marginLeft: 8 }}>
                  Comenzar
                </Button>
              </View>
            </Card.Content>
          </Card>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    padding: appTheme.spacing.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: appTheme.spacing.md,
  },
  icon: {
    fontSize: 40,
  },
  section: {
    padding: appTheme.spacing.lg,
  },
  nomineesList: {
    gap: appTheme.spacing.sm,
  },
  nomineeCard: {
    marginBottom: 4,
  },
  nomineeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  nomineeInfo: {
    flex: 1,
    marginLeft: appTheme.spacing.md,
  },
  adminSection: {
    margin: appTheme.spacing.lg,
    marginTop: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: appTheme.spacing.lg,
  },
  modalContent: {
    borderRadius: 20,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  optionButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  customDateContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
