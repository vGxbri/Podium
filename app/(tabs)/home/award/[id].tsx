import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import * as DocumentPicker from 'expo-document-picker';
import { Image } from 'expo-image';
import * as ImagePicker from "expo-image-picker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useCallback, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  Dialog,
  Portal,
  Surface,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { MemberAvatar } from "../../../../components/MemberAvatar";
import { ConfirmDialog, DialogType } from "../../../../components/ui/ConfirmDialog";
import { useSnackbar } from "../../../../components/ui/SnackbarContext";
import { defaultAwardIcon, getIconComponent, IconName } from "../../../../constants/icons";
import { theme as appTheme } from "../../../../constants/theme";
import { useAuth, useGroup } from "../../../../hooks";
import { awardsService } from "../../../../services";
import { AwardWithNominees } from "../../../../types/database";

// ... constants ...

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
  const { showSnackbar } = useSnackbar();
  
  const { group, isAdmin } = useGroup(groupId);
  const { user } = useAuth();
  
  const [award, setAward] = useState<AwardWithNominees | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [myVote, setMyVote] = useState<string | null>(null);

  // Dialog State
  const [dialogConfig, setDialogConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: DialogType;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    showCancel?: boolean;
  }>({
    visible: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: () => {},
    showCancel: true,
  });

  const hideDialog = () => setDialogConfig(prev => ({ ...prev, visible: false }));

  


  const [showStartVotingModal, setShowStartVotingModal] = useState(false);
  const [deadlineMode, setDeadlineMode] = useState<'24h' | '48h' | '1w' | 'custom'>('24h');
  const [customDate, setCustomDate] = useState("");
  const [customTime, setCustomTime] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Audio nomination temp state
  const [showAudioTitleModal, setShowAudioTitleModal] = useState(false);
  const [audioTitle, setAudioTitle] = useState("");
  const [tempAudio, setTempAudio] = useState<{ uri: string; mimeType?: string; name: string } | null>(null);

  // Text nomination state
  const [showTextModal, setShowTextModal] = useState(false);
  const [textNomination, setTextNomination] = useState("");

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
      showSnackbar("No se pudo cargar el premio", "error");
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
          showSnackbar("Formato de fecha inválido. Usa DD/MM/YYYY y HH:MM", "error");
          return;
        }
        
        deadlineDate = new Date(year, month - 1, day, hour, minute);
        
        if (deadlineDate <= new Date()) {
          showSnackbar("La fecha debe ser futura", "error");
          return;
        }
      }

      setActionLoading(true);
      
      // Validation: Minimum 2 nominees/photos required
      if (award.nominees.length < 2) {
        showSnackbar("Se necesitan mínimo 2 candidatos para empezar la votación", "error");
        return;
      }

      await awardsService.updateAwardStatus(award.id, 'voting', deadlineDate?.toISOString());
      
      setShowStartVotingModal(false);
      fetchAward();
      
    } catch {
      showSnackbar("No se pudo iniciar la votación", "error");
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
      showSnackbar("Tu voto ha sido registrado", "success");
      fetchAward();
    } catch (error: any) {
      showSnackbar(error.message || "No se pudo registrar el voto", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFinishVoting = async () => {
    if (!award) return;
    
    setDialogConfig({
      visible: true,
      title: "Finalizar Votación",
      message: "¿Estás seguro? Se cerrará la votación y se decidirá el ganador.",
      type: "confirm",
      confirmText: "Finalizar",
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await awardsService.declareWinner(award.id);
          fetchAward();
        } catch (error: any) {
          showSnackbar(error.message || "Error al finalizar", "error");
        } finally {
          setActionLoading(false);
        }
      }
    });
  };

  const handleRevealWinner = async () => {
    if (!award) return;

    setDialogConfig({
      visible: true,
      title: "Revelar Ganador",
      message: "¿Quieres mostrar el ganador a todos los miembros?",
      type: "confirm",
      confirmText: "Revelar",
      onConfirm: async () => {
         try {
           setActionLoading(true);
           await awardsService.revealWinner(award.id);
           fetchAward();
         } catch {
           showSnackbar("No se pudo revelar el ganador", "error");
         } finally {
           setActionLoading(false);
         }
      }
    });
  };

  const handleDelete = async () => {
    if (!award) return;

    setDialogConfig({
      visible: true,
      title: "Eliminar Premio",
      message: "¿Estás seguro? Esta acción no se puede deshacer.",
      type: "error",
      confirmText: "Eliminar",
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await awardsService.deleteAward(award.id);
          router.back();
        } catch {
          showSnackbar("No se pudo eliminar", "error");
        }
      }
    });
  };

  const handleAddNomineeWithPhoto = async () => {
    if (!award || !user) return;

    if (award.vote_type === 'text') {
      setShowTextModal(true);
      return;
    }

    try {
      const isVideo = award.vote_type === 'video';
      const isAudio = award.vote_type === 'audio';

      let uri: string | undefined;
      let mimeType: string | undefined;
      let fileName: string | undefined;

      if (isAudio) {
         const docResult = await DocumentPicker.getDocumentAsync({
            type: '*/*', // Allow all files to avoid Android MIME type issues
            copyToCacheDirectory: true,
         });
         
         if (docResult.canceled) return;
         
         const asset = docResult.assets[0];
         const assetNameLower = asset.name.toLowerCase();
         const validAudioExtensions = ['.mp3', '.wav', '.m4a', '.aac', '.flac', '.ogg', '.wma'];
         
         if (!validAudioExtensions.some(ext => assetNameLower.endsWith(ext))) {
            showSnackbar("Por favor selecciona un archivo de audio válido (.mp3, .wav, .m4a, etc.)", "error");
            return;
         }

         uri = asset.uri;
         mimeType = asset.mimeType;
         fileName = asset.name;

         // Open modal to ask for title
         setTempAudio({ uri, mimeType, name: fileName });
         setAudioTitle(""); // Reset title
         setShowAudioTitleModal(true);
         return; // Stop here, wait for modal submit
      } else {
         // Photo or Video
         const result = await ImagePicker.launchImageLibraryAsync({
           mediaTypes: isVideo ? ['videos'] : ['images'],
           allowsEditing: false,
           quality: 0.8,
         });
         if (result.canceled) return;
         uri = result.assets[0].uri;
         mimeType = result.assets[0].mimeType;
         fileName = result.assets[0].fileName || undefined;
      }
      
      setActionLoading(true);

      // 2. Upload Media
      const publicUrl = await awardsService.uploadNomineeMedia(award.id, uri!, mimeType, fileName); // uri is guaranteed here

      // 3. Add Nominee
      await awardsService.addNominee(award.id, user.id, undefined, publicUrl);
      
      let typeLabel = 'Foto';
      if (isVideo) typeLabel = 'Vídeo';

      showSnackbar(`${typeLabel} añadida correctamente`, "success");
      fetchAward();

    } catch (error: any) {
      console.error(error);
      showSnackbar(error.message || "No se pudo subir", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitAudioNomination = async () => {
    if (!tempAudio || !award || !user) return;
    if (!audioTitle.trim()) {
        showSnackbar("Por favor añade un título al audio", "error");
        return;
    }

    try {
        setActionLoading(true);
        // Upload
        const publicUrl = await awardsService.uploadNomineeMedia(award.id, tempAudio.uri, tempAudio.mimeType, tempAudio.name);
        
        // Add nominee with Reason = Title
        await awardsService.addNominee(award.id, user.id, audioTitle, publicUrl);

        showSnackbar("Audio añadido correctamente", "success");
        setShowAudioTitleModal(false);
        setTempAudio(null);
        setAudioTitle("");
        fetchAward();
    } catch (error: any) {
        showSnackbar(error.message, "error");
    } finally {
        setActionLoading(false);
    }
  };

  const handleSubmitTextNomination = async () => {
    if (!textNomination.trim() || !award || !user) return;
    
    try {
      setActionLoading(true);
      await awardsService.addNominee(award.id, user.id, undefined, textNomination);
      showSnackbar("Texto añadido correctamente", "success");
      setShowTextModal(false);
      setTextNomination("");
      fetchAward();
    } catch (error: any) {
      showSnackbar(error.message, "error");
    } finally {
      setActionLoading(false);
    }
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
            {getIconComponent((award.icon as IconName) || defaultAwardIcon, 40, theme.colors.primary)}
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
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text variant="bodyLarge" style={{ fontWeight: "500" }}>
                        {nominee.user.display_name}
                      </Text>
                      {award.status === 'completed' && nominee.is_winner && award.is_revealed && (
                        <Chip compact icon={() => <Ionicons name="trophy" size={12} color="#000" />} style={{ backgroundColor: '#FFD700', height: 24 }}>
                          Ganador
                        </Chip>
                      )}
                    </View>
                    
                      {nominee.content_url && (
                        <>
                          {award.vote_type === 'video' ? (
                            <TouchableOpacity onPress={() => setSelectedImage(nominee.content_url)} activeOpacity={0.9}>
                               <View style={styles.nomineeImage}>
                                 <NomineeVideoThumbnail uri={nominee.content_url} />
                               </View>
                            </TouchableOpacity>
                          ) : award.vote_type === 'audio' ? (
                            <TouchableOpacity onPress={() => setSelectedImage(nominee.content_url)} activeOpacity={0.9}>
                               <NomineeAudioPlayer uri={nominee.content_url} title={nominee.nomination_reason || 'Audio'} />
                            </TouchableOpacity>
                          ) : award.vote_type === 'text' ? (
                             <NomineeTextCard text={nominee.content_url} />
                          ) : (
                            <TouchableOpacity onPress={() => setSelectedImage(nominee.content_url)} activeOpacity={0.9}>
                               <Image 
                                 source={{ uri: nominee.content_url }} 
                                 style={styles.nomineeImage} 
                                 contentFit="cover" 
                               />
                            </TouchableOpacity>
                          )}
                        </>
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

              {award.status === 'draft' && ['photo', 'video', 'audio', 'text'].includes(award.vote_type) && (
                <Button 
                  mode="outlined" 
                  icon={award.vote_type === 'video' ? "video" : award.vote_type === 'audio' ? "microphone" : award.vote_type === 'text' ? "text" : "camera"} 
                  onPress={handleAddNomineeWithPhoto}
                  style={{ marginTop: 10 }}
                  loading={actionLoading}
                >
                  {award.vote_type === 'video' ? "Añadir Vídeo" : award.vote_type === 'audio' ? "Añadir Audio" : award.vote_type === 'text' ? "Añadir Texto" : "Añadir Foto"}
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

      <Modal
        visible={!!selectedImage}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={styles.fullScreenImageContainer}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => setSelectedImage(null)}
          >
            <Ionicons name="close-circle" size={40} color="white" />
          </TouchableOpacity>
          
          {award?.vote_type === 'video' ? (
            <FullScreenVideoPlayer uri={selectedImage || ''} />
          ) : award?.vote_type === 'audio' ? (
            <FullScreenAudioPlayer uri={selectedImage || ''} />
          ) : (
            <Image 
              source={{ uri: selectedImage || undefined }} 
              style={styles.fullScreenImage} 
              contentFit="contain" 
            />
          )}
        </View>
      </Modal>

      {/* Text Nomination Modal */}
      <Portal>
        <Dialog visible={showTextModal} onDismiss={() => setShowTextModal(false)}>
          <Dialog.Title>Tu Nominación</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Escribe tu texto"
              value={textNomination}
              onChangeText={setTextNomination}
              multiline
              numberOfLines={4}
              mode="outlined"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowTextModal(false)}>Cancelar</Button>
            <Button onPress={handleSubmitTextNomination} loading={actionLoading}>Enviar</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Audio Title Modal */}
        <Dialog visible={showAudioTitleModal} onDismiss={() => setShowAudioTitleModal(false)}>
            <Dialog.Title>Título del Audio</Dialog.Title>
            <Dialog.Content>
                <TextInput 
                    label="Título del audio"
                    value={audioTitle}
                    onChangeText={setAudioTitle}
                    mode="outlined"
                />
            </Dialog.Content>
            <Dialog.Actions>
                <Button onPress={() => setShowAudioTitleModal(false)}>Cancelar</Button>
                <Button onPress={handleSubmitAudioNomination} loading={actionLoading}>Subir</Button>
            </Dialog.Actions>
        </Dialog>
      </Portal>

      <ConfirmDialog
        visible={dialogConfig.visible}
        title={dialogConfig.title}
        message={dialogConfig.message}
        type={dialogConfig.type}
        confirmText={dialogConfig.confirmText}
        cancelText={dialogConfig.cancelText}
        onConfirm={dialogConfig.onConfirm}
        onCancel={hideDialog}
        showCancel={dialogConfig.showCancel}
      />
    </>
  );
}

// Video Helper Components
function NomineeVideoThumbnail({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, player => {
    player.muted = true;
    player.loop = true;
  });

  return (
    <View style={{ flex: 1 }}>
      <VideoView 
        player={player} 
        style={StyleSheet.absoluteFill} 
        contentFit="cover"
        nativeControls={false}
      />
      <View style={{...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', pointerEvents: 'none'}}>
          <Ionicons name="play-circle" size={40} color="white" />
      </View>
    </View>
  );
}

function FullScreenVideoPlayer({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, player => {
    player.play();
    player.loop = true;
  });

  return (
    <VideoView 
      player={player} 
      style={{ width: '100%', height: '100%' }} 
      contentFit="contain"
      allowsPictureInPicture
      fullscreenOptions={{ enable: true }}
    />
  );
}

function NomineeAudioPlayer({ uri, title }: { uri: string, title?: string }) {
  // Simple thumbnail: icon + title
  return (
    <View style={[styles.nomineeImage, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}>
       <Ionicons name="musical-notes" size={48} color="#666" />
       {title && (
         <Text variant="labelMedium" style={{ marginTop: 8, color: '#333', fontWeight: 'bold' }} numberOfLines={1}>
            {title}
         </Text>
       )}
       <View style={{ position: 'absolute', bottom: 5, right: 5 }}>
          <Ionicons name="play-circle" size={24} color="#000" />
       </View>
    </View>
  );
}

function FullScreenAudioPlayer({ uri }: { uri: string }) {
  const player = useAudioPlayer(uri || null);
  const status = useAudioPlayerStatus(player);

  const togglePlay = () => {
    if (status.playing) player.pause();
    else player.play();
  };

  return (
    <View style={[styles.fullScreenImage, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }]}>
       <Ionicons name="musical-notes" size={100} color="#fff" style={{ marginBottom: 40 }}/>
       
       <TouchableOpacity onPress={togglePlay}>
          <Ionicons 
             name={status.playing ? "pause-circle" : "play-circle"} 
             size={80} 
             color="#fff" 
          />
       </TouchableOpacity>
       
       <Text style={{ color: 'white', marginTop: 20 }}>
          {status.currentTime ? Math.floor(status.currentTime / 1000) : 0}s / {status.duration ? Math.floor(status.duration / 1000) : 0}s
       </Text>
    </View>
  );
}

function NomineeTextCard({ text }: { text: string }) {
  // Enhanced card for text: scrollable if long, better styling
  return (
    <View style={[styles.nomineeImage, { backgroundColor: '#fff', padding: 8, justifyContent: 'flex-start' }]}>
       <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={true}>
          <Text style={{ fontSize: 13, lineHeight: 18, color: '#333', fontStyle: 'italic' }}>
            &quot;{text}&quot;
          </Text>
       </ScrollView>
    </View>
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
  nomineeImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: '#f0f0f0',
  },
  fullScreenImageContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
  },
});
