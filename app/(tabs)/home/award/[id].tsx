import { useFocusEffect } from "@react-navigation/native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { MemberAvatar } from "../../../../components/MemberAvatar";
import { Button } from "../../../../components/ui/Button";
import { Card } from "../../../../components/ui/Card";
import { Colors } from "../../../../constants/Colors";
import { theme } from "../../../../constants/theme";
import { useGroup } from "../../../../hooks";
import { awardsService } from "../../../../services";
import { AwardWithNominees } from "../../../../types/database";

// Utility to format date
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
  
  const { isAdmin } = useGroup(groupId);
  
  const [award, setAward] = useState<AwardWithNominees | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Voting State
  const [myVote, setMyVote] = useState<string | null>(null);
  
  // Start Voting Modal State
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
        // Parse custom date DD/MM/YYYY HH:MM
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
      await awardsService.updateAwardStatus(
        award.id, 
        'voting', 
        deadlineDate?.toISOString()
      );
      
      setShowStartVotingModal(false);
      fetchAward(); // Refresh
      
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
      fetchAward(); // Refresh counts if needed, though usually hidden
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
              // First verify we have votes? Logic inside declareWinner handles it?
              // Assuming declareWinner changes status to 'completed'
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
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!award) {
    return (
      <View style={styles.centerContainer}>
        <Text>Premio no encontrado</Text>
      </View>
    );
  }

  // const isNominee = award.nominees.some(n => n.user_id === group?.my_role /* wait, need user id */); 
  // We don't have user ID easily here in hooks, but service checks it. 
  // We can try to guess from 'my_role' but better to catch error from service 
  // or use supabase.auth.getUser() in effect if we want to disable button UI.
  // For now rely on service error.

  return (
    <>
      <Stack.Screen options={{ title: "Detalles del Premio" }} />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{award.icon}</Text>
          </View>
          <Text style={styles.title}>{award.name}</Text>
          {award.description && (
            <Text style={styles.description}>{award.description}</Text>
          )}
          
          <View style={[
            styles.statusBadge, 
            award.status === 'voting' && styles.statusBadgeVoting,
            award.status === 'completed' && styles.statusBadgeCompleted
          ]}>
            <Text style={[
              styles.statusText,
              award.status === 'voting' && styles.statusTextVoting,
              award.status === 'completed' && styles.statusTextCompleted
            ]}>
              {award.status === 'draft' && "Borrador"}
              {award.status === 'voting' && "Votación en curso"}
              {award.status === 'completed' && "Finalizado"}
            </Text>
          </View>

          {award.status === 'voting' && award.voting_ends_at && (
            <Text style={styles.deadlineText}>
              Termina: {formatDate(award.voting_ends_at)}
            </Text>
          )}

          {award.status === 'completed' && (
             <Text style={styles.winnerTextHeader}>
               {award.is_revealed 
                 ? "¡Ganador revelado!" 
                 : "La votación ha finalizado. Ganador pendiente de revelar."}
             </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nominados ({award.nominees.length})</Text>
          
          <View style={styles.nomineesList}>
            {award.nominees.map((nominee) => (
              <Card key={nominee.id} variant="glass" padding="sm" style={styles.nomineeCard}>
                <View style={styles.nomineeRow}>
                  <MemberAvatar user={nominee.user} size="md" />
                  <View style={styles.nomineeInfo}>
                    <Text style={styles.nomineeName}>{nominee.user.display_name}</Text>
                    {award.status === 'completed' && nominee.is_winner && award.is_revealed && (
                       <View style={styles.winnerBadge}>
                         <Text style={styles.winnerText}>🏆 Ganador</Text>
                       </View>
                    )}
                  </View>
                  
                  {award.status === 'voting' && (
                    <Button 
                      title={myVote === nominee.id ? "Votado" : "Votar"}
                      size="sm"
                      variant={myVote === nominee.id ? "primary" : "secondary"}
                      disabled={!!myVote || actionLoading}
                      onPress={() => handleVote(nominee.id)}
                    />
                  )}
                </View>
              </Card>
            ))}
          </View>
        </View>

        {/* Admin Actions */}
        {isAdmin && (
          <View style={styles.adminSection}>
            <Text style={styles.adminTitle}>Administración</Text>
            
            {award.status === 'draft' && (
              <Button 
                title="Iniciar Votación"
                onPress={() => setShowStartVotingModal(true)}
                loading={actionLoading}
              />
            )}
            
            {award.status === 'voting' && (
              <Button 
                title="Finalizar Votación Ahora"
                variant="secondary"
                onPress={handleFinishVoting}
                loading={actionLoading}
                style={{ marginBottom: 10 }}
              />
            )}

            {award.status === 'completed' && !award.is_revealed && (
              <Button 
                title="Revelar Ganador"
                onPress={handleRevealWinner}
                loading={actionLoading}
                style={{ marginBottom: 10 }}
                variant="primary"
              />
            )}
            
            <Button 
              title="Eliminar Premio"
              variant="ghost"
              onPress={handleDelete}
              style={{ marginTop: 10 }}
              textStyle={{ color: Colors.error }}
            />
          </View>
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
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Configurar Votación</Text>
            <Text style={styles.modalSubtitle}>Elige cuándo termina la votación:</Text>
            
            <View style={styles.optionsContainer}>
              {(['24h', '48h', '1w', 'custom'] as const).map((mode) => (
                <TouchableOpacity
                  key={mode}
                  style={[
                    styles.optionButton,
                    deadlineMode === mode && styles.optionButtonSelected
                  ]}
                  onPress={() => setDeadlineMode(mode)}
                >
                  <Text style={[
                    styles.optionText,
                    deadlineMode === mode && styles.optionTextSelected
                  ]}>
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
                  placeholder="DD/MM/YYYY"
                  style={styles.input}
                  value={customDate}
                  onChangeText={setCustomDate}
                />
                <TextInput
                  placeholder="HH:MM"
                  style={styles.input}
                  value={customTime}
                  onChangeText={setCustomTime}
                />
              </View>
            )}

            <View style={styles.modalActions}>
              <Button 
                title="Cancelar" 
                variant="ghost" 
                onPress={() => setShowStartVotingModal(false)} 
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button 
                title="Comenzar" 
                onPress={handleStartVoting} 
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
          </View>
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
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    alignItems: "center",
    padding: theme.spacing.xl,
    backgroundColor: Colors.backgroundLight,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    textAlign: "center",
    marginBottom: theme.spacing.sm,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    marginBottom: theme.spacing.sm,
  },
  statusBadgeVoting: {
    backgroundColor: 'rgba(255, 159, 10, 0.15)',
  },
  statusBadgeCompleted: {
    backgroundColor: 'rgba(50, 215, 75, 0.15)',
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  statusTextVoting: {
    color: Colors.warning,
  },
  statusTextCompleted: {
    color: Colors.success,
  },
  deadlineText: {
    fontSize: 14,
    color: Colors.error,
    fontWeight: "500",
    marginTop: 4,
  },

  section: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: theme.spacing.md,
  },
  nomineesList: {
    gap: theme.spacing.sm,
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
    marginLeft: theme.spacing.md,
  },
  nomineeName: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: "500",
  },
  adminSection: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  adminTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: theme.spacing.md,
    textTransform: "uppercase",
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderRadius: 20,
    padding: theme.spacing.xl,
    ...theme.shadows.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
    textAlign: "center",
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
    borderColor: Colors.border,
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionText: {
    color: Colors.text,
    fontWeight: "500",
  },
  optionTextSelected: {
    color: Colors.textOnPrimary,
  },
  customDateContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 8,
    color: Colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  winnerBadge: {
    backgroundColor: Colors.gold,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  winnerText: {
    color: Colors.textOnPrimary,
    fontSize: 12,
    fontWeight: "bold",
  },
  winnerTextHeader: {
    fontSize: 16,
    color: Colors.success,
    fontWeight: "600",
    marginTop: 8,
  },
});

