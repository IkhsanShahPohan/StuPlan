// import { tasks } from "@/db/schema";
// import { Ionicons } from "@expo/vector-icons";
// import { eq } from "drizzle-orm";
// import { drizzle } from "drizzle-orm/expo-sqlite";
// import { useSQLiteContext } from "expo-sqlite";
// import React, { useEffect, useState } from "react";
// import {
//   Alert,
//   Modal,
//   Platform,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useSubtasks } from "../../hooks/useTasks";
// import { useLocalSearchParams } from "expo-router";

// export default function TaskDetailModal({
//   visible,
//   task,
//   onClose,
//   onUpdate,
// }: any) {
//   const { id } = useLocalSearchParams();
//   const [newSubtask, setNewSubtask] = useState("");
//   const [localTask, setLocalTask] = useState(task);
//   const [showNotesModal, setShowNotesModal] = useState(false);
//   const [notesWordCount, setNotesWordCount] = useState(0);
//   const {
//     subtasks,
//     createSubtask,
//     toggleSubtask,
//     deleteSubtask,
//     refreshSubtasks,
//   } = useSubtasks(task?.id || 0);
//   const x = useSQLiteContext(); // ← kamu tetap pakai hook
//   const db = drizzle(x);

//   // Update word count
//   useEffect(() => {
//     if (localTask.notes) {
//       const words = localTask.notes
//         .trim()
//         .split(/\s+/)
//         .filter((w: string) => w.length > 0);
//       setNotesWordCount(words.length);
//     }
//   }, [localTask.notes]);

//   // Auto-update status based on subtasks
//   useEffect(() => {
//     const updateStatus = async () => {
//       if (subtasks.length === 0) return;

//       const completedCount = subtasks.filter((s: any) => s.completed).length;
//       let newStatus = "pending";

//       if (completedCount === subtasks.length) {
//         newStatus = "completed";
//       } else if (completedCount > 0) {
//         newStatus = "in_progress";
//       }

//       if (newStatus !== localTask.status) {
//         try {
//           await db
//             .update(tasks)
//             .set({ status: newStatus, updatedAt: new Date().toISOString() })
//             .where(eq(tasks.id, task.id));

//           setLocalTask({ ...localTask, status: newStatus });
//           onUpdate();
//         } catch (error) {
//           console.error("Error updating status:", error);
//         }
//       }
//     };

//     updateStatus();
//   }, [subtasks]);

//   const handleAddSubtask = async () => {
//     if (!newSubtask.trim()) {
//       Alert.alert("Error", "Subtask tidak boleh kosong");
//       return;
//     }
//     try {
//       await createSubtask(newSubtask.trim());
//       setNewSubtask("");
//       await refreshSubtasks();
//     } catch {
//       Alert.alert("Error", "Gagal menambah subtask");
//     }
//   };

//   const handleToggleSubtask = async (id: number, completed: boolean) => {
//     try {
//       await toggleSubtask(id, completed);
//       await refreshSubtasks();
//     } catch {
//       Alert.alert("Error", "Gagal mengubah status");
//     }
//   };

//   const handleDeleteSubtask = async (id: number) => {
//     try {
//       await deleteSubtask(id);
//       await refreshSubtasks();
//     } catch {
//       Alert.alert("Error", "Gagal menghapus subtask");
//     }
//   };

//   const completedCount = subtasks.filter((s: any) => s.completed).length;
//   const progress =
//     subtasks.length > 0 ? (completedCount / subtasks.length) * 100 : 0;

//   const statusConfig = {
//     pending: { label: "Pending", color: "#FF9500", icon: "time-outline" },
//     in_progress: {
//       label: "Berjalan",
//       color: "#007AFF",
//       icon: "play-circle-outline",
//     },
//     completed: {
//       label: "Selesai",
//       color: "#34C759",
//       icon: "checkmark-circle-outline",
//     },
//   };

//   const currentStatus =
//     statusConfig[localTask.status as keyof typeof statusConfig];

//   return (
//     <Modal
//       visible={visible}
//       animationType="slide"
//       presentationStyle="pageSheet"
//       onRequestClose={onClose}
//     >
//       <SafeAreaView style={styles.modalSafe}>
//         <View style={styles.modalHeader}>
//           <TouchableOpacity onPress={onClose}>
//             <Ionicons name="chevron-back" size={28} color="#007AFF" />
//           </TouchableOpacity>
//           <Text style={styles.modalTitle}>Detail Tugas</Text>
//           <View style={{ width: 28 }} />
//         </View>

//         <ScrollView
//           style={styles.detailBody}
//           showsVerticalScrollIndicator={false}
//         >
//           {/* Status Badge */}
//           <View
//             style={[
//               styles.statusBadge,
//               { backgroundColor: currentStatus.color + "20" },
//             ]}
//           >
//             <Ionicons
//               name={currentStatus.icon as any}
//               size={20}
//               color={currentStatus.color}
//             />
//             <Text
//               style={[styles.statusBadgeText, { color: currentStatus.color }]}
//             >
//               {currentStatus.label}
//             </Text>
//           </View>

//           {/* Title */}
//           <Text style={styles.detailTitle}>{localTask.title}</Text>

//           {/* Description */}
//           {localTask.description && (
//             <View style={styles.detailSection}>
//               <Text style={styles.detailSectionTitle}>DESKRIPSI</Text>
//               <Text style={styles.detailText}>{localTask.description}</Text>
//             </View>
//           )}

//           {/* Notes */}
//           {localTask.notes && (
//             <View style={styles.detailSection}>
//               <View style={styles.detailSectionHeader}>
//                 <Text style={styles.detailSectionTitle}>CATATAN</Text>
//                 <TouchableOpacity onPress={() => setShowNotesModal(true)}>
//                   <Ionicons name="pencil" size={18} color="#007AFF" />
//                 </TouchableOpacity>
//               </View>
//               <TouchableOpacity
//                 style={styles.notesDetailCard}
//                 onPress={() => setShowNotesModal(true)}
//                 activeOpacity={0.7}
//               >
//                 <Text style={styles.notesDetailText}>{localTask.notes}</Text>
//                 <View style={styles.notesDetailFooter}>
//                   <Text style={styles.notesDetailMeta}>
//                     {notesWordCount} kata
//                   </Text>
//                   <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
//                 </View>
//               </TouchableOpacity>
//             </View>
//           )}

//           {/* Notes Editor Modal in Detail */}
//           <Modal
//             visible={showNotesModal}
//             animationType="slide"
//             presentationStyle="fullScreen"
//             onRequestClose={() => setShowNotesModal(false)}
//           >
//             <SafeAreaView style={styles.notesEditorContainer}>
//               <View style={styles.notesEditorHeader}>
//                 <TouchableOpacity
//                   style={styles.notesEditorBackBtn}
//                   onPress={() => setShowNotesModal(false)}
//                 >
//                   <Ionicons name="chevron-back" size={28} color="#007AFF" />
//                   <Text style={styles.notesEditorBackText}>Kembali</Text>
//                 </TouchableOpacity>
//                 <View style={styles.notesEditorInfo}>
//                   <Text style={styles.notesEditorWordCount}>
//                     {notesWordCount} kata
//                   </Text>
//                 </View>
//               </View>

//               <ScrollView
//                 style={styles.notesEditorBody}
//                 keyboardShouldPersistTaps="handled"
//               >
//                 <TextInput
//                   style={styles.notesEditorInput}
//                   value={localTask.notes || ""}
//                   onChangeText={(text) => {
//                     setLocalTask({ ...localTask, notes: text });
//                     // Save to database
//                     db.update(tasks)
//                       .set({ notes: text })
//                       .where(eq(tasks.id, task.id))
//                       .then(() => onUpdate());
//                   }}
//                   placeholder="Mulai menulis catatan Anda..."
//                   placeholderTextColor="#C7C7CC"
//                   multiline
//                   autoFocus
//                   textAlignVertical="top"
//                 />
//               </ScrollView>

//               <View style={styles.notesEditorToolbar}>
//                 <TouchableOpacity
//                   style={styles.notesToolbarBtn}
//                   onPress={() => {
//                     setLocalTask({ ...localTask, notes: "" });
//                     db.update(tasks)
//                       .set({ notes: null })
//                       .where(eq(tasks.id, task.id))
//                       .then(() => onUpdate());
//                   }}
//                 >
//                   <Ionicons name="trash-outline" size={24} color="#FF3B30" />
//                 </TouchableOpacity>
//                 <View style={styles.notesToolbarDivider} />
//                 <Text style={styles.notesToolbarDate}>
//                   {new Date().toLocaleString("id-ID", {
//                     day: "numeric",
//                     month: "long",
//                     year: "numeric",
//                     hour: "2-digit",
//                     minute: "2-digit",
//                   })}
//                 </Text>
//               </View>
//             </SafeAreaView>
//           </Modal>

//           {/* Deadline */}
//           <View style={styles.detailSection}>
//             <Text style={styles.detailSectionTitle}>DEADLINE</Text>
//             <View style={styles.detailInfoRow}>
//               <Ionicons name="calendar-outline" size={20} color="#007AFF" />
//               <Text style={styles.detailInfoText}>
//                 {new Date(localTask.deadline).toLocaleDateString("id-ID", {
//                   weekday: "long",
//                   day: "numeric",
//                   month: "long",
//                   year: "numeric",
//                 })}
//               </Text>
//             </View>
//           </View>

//           {/* Subtasks */}
//           <View style={styles.detailSection}>
//             <View style={styles.subtaskHeader}>
//               <Text style={styles.detailSectionTitle}>SUBTASK</Text>
//               {subtasks.length > 0 && (
//                 <View style={styles.progressBadge}>
//                   <Text style={styles.progressText}>
//                     {completedCount}/{subtasks.length}
//                   </Text>
//                   <View style={styles.progressBarContainer}>
//                     <View
//                       style={[styles.progressBar, { width: `${progress}%` }]}
//                     />
//                   </View>
//                 </View>
//               )}
//             </View>

//             {/* Add Subtask */}
//             <View style={styles.addSubtaskRow}>
//               <TextInput
//                 style={styles.addSubtaskInput}
//                 value={newSubtask}
//                 onChangeText={setNewSubtask}
//                 placeholder="Tambah subtask baru..."
//                 placeholderTextColor="#C7C7CC"
//                 onSubmitEditing={handleAddSubtask}
//                 returnKeyType="done"
//               />
//               <TouchableOpacity
//                 style={styles.addSubtaskIconBtn}
//                 onPress={handleAddSubtask}
//               >
//                 <Ionicons name="add-circle" size={32} color="#007AFF" />
//               </TouchableOpacity>
//             </View>

//             {/* Subtask List */}
//             {subtasks.map((subtask: any) => (
//               <View key={subtask.id} style={styles.subtaskItem}>
//                 <TouchableOpacity
//                   style={styles.subtaskCheckbox}
//                   onPress={() =>
//                     handleToggleSubtask(subtask.id, subtask.completed ? 0 : 1)
//                   }
//                   activeOpacity={0.7}
//                 >
//                   <Ionicons
//                     name={
//                       subtask.completed ? "checkmark-circle" : "ellipse-outline"
//                     }
//                     size={24}
//                     color={subtask.completed ? "#34C759" : "#C7C7CC"}
//                   />
//                 </TouchableOpacity>
//                 <Text
//                   style={[
//                     styles.subtaskText,
//                     subtask.completed && styles.subtaskCompleted,
//                   ]}
//                 >
//                   {subtask.title}
//                 </Text>
//                 <TouchableOpacity
//                   onPress={() => handleDeleteSubtask(subtask.id)}
//                   hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
//                 >
//                   <Ionicons name="trash-outline" size={20} color="#FF3B30" />
//                 </TouchableOpacity>
//               </View>
//             ))}

//             {subtasks.length === 0 && (
//               <View style={styles.emptySubtasks}>
//                 <Ionicons name="list-outline" size={48} color="#C7C7CC" />
//                 <Text style={styles.emptySubtasksText}>Belum ada subtask</Text>
//               </View>
//             )}
//           </View>

//           <View style={{ height: 40 }} />
//         </ScrollView>
//       </SafeAreaView>
//     </Modal>
//   );
// }
// const styles = StyleSheet.create({
//   // Loading
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#F2F2F7",
//   },
//   loadingText: {
//     marginTop: 16,
//     fontSize: 16,
//     color: "#8E8E93",
//     fontWeight: "500",
//   },

//   // Container
//   container: {
//     flex: 1,
//     backgroundColor: "#F2F2F7",
//   },

//   // Header
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     paddingTop: 12,
//     paddingBottom: 16,
//     backgroundColor: "#FFFFFF",
//   },
//   headerTitle: {
//     fontSize: 34,
//     fontWeight: "700",
//     color: "#000000",
//   },
//   headerSubtitle: {
//     fontSize: 15,
//     color: "#8E8E93",
//     marginTop: 2,
//   },
//   filterBtn: {
//     width: 44,
//     height: 44,
//     justifyContent: "center",
//     alignItems: "center",
//     borderRadius: 22,
//     backgroundColor: "#F2F2F7",
//   },

//   // Search
//   searchContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#F2F2F7",
//     marginHorizontal: 16,
//     marginVertical: 12,
//     paddingHorizontal: 12,
//     height: 44,
//     borderRadius: 10,
//   },
//   searchIcon: {
//     marginRight: 8,
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 16,
//     color: "#000000",
//   },

//   // Content
//   content: {
//     flex: 1,
//     paddingHorizontal: 16,
//   },

//   // Empty State
//   emptyState: {
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 80,
//   },
//   emptyText: {
//     fontSize: 22,
//     fontWeight: "600",
//     color: "#8E8E93",
//     marginTop: 16,
//   },
//   emptySubtext: {
//     fontSize: 15,
//     color: "#C7C7CC",
//     marginTop: 8,
//     textAlign: "center",
//   },

//   // Task Card
//   taskCard: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 12,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   taskHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   statusDot: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     marginRight: 10,
//   },
//   taskTitle: {
//     flex: 1,
//     fontSize: 17,
//     fontWeight: "600",
//     color: "#000000",
//   },
//   taskDesc: {
//     fontSize: 15,
//     color: "#8E8E93",
//     lineHeight: 20,
//     marginBottom: 12,
//     paddingLeft: 20,
//   },
//   taskFooter: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingLeft: 20,
//   },
//   deadlineRow: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   deadlineText: {
//     fontSize: 13,
//     color: "#8E8E93",
//     marginLeft: 6,
//   },
//   overdueText: {
//     color: "#FF3B30",
//     fontWeight: "600",
//   },
//   deleteBtn: {
//     width: 36,
//     height: 36,
//     justifyContent: "center",
//     alignItems: "center",
//     borderRadius: 18,
//     backgroundColor: "#FFF5F5",
//   },

//   // FAB
//   fab: {
//     position: "absolute",
//     right: 20,
//     bottom: 80,
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     backgroundColor: "#007AFF",
//     justifyContent: "center",
//     alignItems: "center",
//     shadowColor: "#007AFF",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.4,
//     shadowRadius: 12,
//     elevation: 8,
//   },

//   // Modal
//   modalContainer: {
//     flex: 1,
//     backgroundColor: "#F2F2F7",
//   },
//   modalSafe: {
//     flex: 1,
//     backgroundColor: "#F2F2F7",
//   },
//   modalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     backgroundColor: "#FFFFFF",
//     borderBottomWidth: 0.5,
//     borderBottomColor: "#C6C6C8",
//   },
//   modalCancel: {
//     fontSize: 17,
//     color: "#007AFF",
//   },
//   modalTitle: {
//     fontSize: 17,
//     fontWeight: "600",
//     color: "#000000",
//   },
//   modalDone: {
//     fontSize: 17,
//     fontWeight: "600",
//     color: "#007AFF",
//   },
//   modalBody: {
//     flex: 1,
//     paddingHorizontal: 16,
//   },

//   // Form
//   formGroup: {
//     marginTop: 24,
//   },
//   formLabel: {
//     fontSize: 13,
//     fontWeight: "600",
//     color: "#8E8E93",
//     marginBottom: 8,
//     letterSpacing: 0.5,
//   },
//   formInput: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 10,
//     padding: 16,
//     fontSize: 17,
//     color: "#000000",
//     borderWidth: 1,
//     borderColor: "#E5E5EA",
//   },
//   textArea: {
//     height: 100,
//     textAlignVertical: "top",
//   },

//   // Date Picker
//   datePickerBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#FFFFFF",
//     borderRadius: 10,
//     padding: 16,
//     borderWidth: 1,
//     borderColor: "#E5E5EA",
//   },
//   datePickerText: {
//     fontSize: 17,
//     color: "#000000",
//     marginLeft: 12,
//   },

//   // Subtask Input
//   subtaskInputRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#FFFFFF",
//     borderRadius: 10,
//     paddingLeft: 16,
//     paddingRight: 8,
//     borderWidth: 1,
//     borderColor: "#E5E5EA",
//   },
//   subtaskInput: {
//     flex: 1,
//     fontSize: 17,
//     color: "#000000",
//     paddingVertical: 12,
//   },
//   addSubtaskBtn: {
//     padding: 4,
//   },

//   // Subtask Preview
//   subtaskPreview: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#FFFFFF",
//     borderRadius: 10,
//     padding: 12,
//     marginTop: 8,
//     borderWidth: 1,
//     borderColor: "#E5E5EA",
//   },
//   subtaskPreviewText: {
//     flex: 1,
//     fontSize: 15,
//     color: "#000000",
//     marginLeft: 12,
//   },

//   // Filter Modal
//   filterOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0, 0, 0, 0.4)",
//     justifyContent: "flex-end",
//   },
//   filterContent: {
//     backgroundColor: "#FFFFFF",
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     paddingBottom: 40,
//   },
//   filterHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 20,
//     borderBottomWidth: 0.5,
//     borderBottomColor: "#C6C6C8",
//   },
//   filterTitle: {
//     fontSize: 20,
//     fontWeight: "600",
//     color: "#000000",
//   },
//   filterBody: {
//     padding: 20,
//   },
//   filterMainLabel: {
//     fontSize: 15,
//     fontWeight: "600",
//     color: "#000000",
//     marginBottom: 16,
//   },
//   filterLabel: {
//     fontSize: 15,
//     fontWeight: "600",
//     color: "#000000",
//     marginBottom: 8,
//     marginTop: 16,
//   },
//   dateRangeRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//     marginBottom: 24,
//   },
//   dateRangeBtn: {
//     flex: 1,
//     backgroundColor: "#FFFFFF",
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "#E5E5EA",
//     padding: 12,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   dateRangeBtnContent: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   dateRangeBtnText: {
//     marginLeft: 8,
//     flex: 1,
//   },
//   dateRangeLabel: {
//     fontSize: 11,
//     color: "#8E8E93",
//     marginBottom: 2,
//   },
//   dateRangeValue: {
//     fontSize: 15,
//     fontWeight: "600",
//     color: "#000000",
//   },
//   dateRangeSeparator: {
//     width: 24,
//     height: 24,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   filterActionsRow: {
//     flexDirection: "row",
//     gap: 12,
//     marginTop: 8,
//   },
//   filterResetBtn: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#FFF5F5",
//     borderRadius: 12,
//     padding: 16,
//     gap: 8,
//   },
//   filterResetText: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#FF3B30",
//   },
//   filterDateBtn: {
//     backgroundColor: "#F2F2F7",
//     borderRadius: 10,
//     padding: 16,
//   },
//   filterDateText: {
//     fontSize: 17,
//     color: "#007AFF",
//   },
//   filterApplyBtn: {
//     flex: 2,
//     backgroundColor: "#007AFF",
//     borderRadius: 12,
//     padding: 16,
//     alignItems: "center",
//   },
//   filterApplyText: {
//     fontSize: 17,
//     fontWeight: "600",
//     color: "#FFFFFF",
//   },

//   // Detail Modal
//   detailBody: {
//     flex: 1,
//     paddingHorizontal: 20,
//   },
//   statusBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     alignSelf: "flex-start",
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 20,
//     marginTop: 16,
//   },
//   statusBadgeText: {
//     fontSize: 15,
//     fontWeight: "600",
//     marginLeft: 6,
//   },
//   detailTitle: {
//     fontSize: 28,
//     fontWeight: "700",
//     color: "#000000",
//     marginTop: 16,
//     lineHeight: 34,
//   },
//   detailSection: {
//     marginTop: 24,
//   },
//   detailSectionTitle: {
//     fontSize: 13,
//     fontWeight: "600",
//     color: "#8E8E93",
//     letterSpacing: 0.5,
//     marginBottom: 12,
//   },
//   detailSectionHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   detailText: {
//     fontSize: 17,
//     color: "#000000",
//     lineHeight: 24,
//   },

//   // Notes Preview Card in Form
//   notesPreviewCard: {
//     backgroundColor: "#FFFEF7",
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "#F0EDD4",
//     padding: 16,
//     minHeight: 100,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   notesPreviewContent: {
//     flex: 1,
//   },
//   notesPreviewText: {
//     fontSize: 15,
//     color: "#3C3C3C",
//     lineHeight: 22,
//     marginBottom: 12,
//   },
//   notesPreviewFooter: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingTop: 8,
//     borderTopWidth: 1,
//     borderTopColor: "#F0EDD4",
//   },
//   notesPreviewMeta: {
//     fontSize: 12,
//     color: "#8E8E93",
//   },
//   notesEmptyState: {
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 20,
//   },
//   notesEmptyText: {
//     fontSize: 15,
//     color: "#C7C7CC",
//     marginTop: 8,
//   },

//   // Notes Detail Card
//   notesDetailCard: {
//     backgroundColor: "#FFFEF7",
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "#F0EDD4",
//     padding: 16,
//   },
//   notesDetailText: {
//     fontSize: 16,
//     color: "#3C3C3C",
//     lineHeight: 24,
//     marginBottom: 12,
//   },
//   notesDetailFooter: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingTop: 12,
//     borderTopWidth: 1,
//     borderTopColor: "#F0EDD4",
//   },
//   notesDetailMeta: {
//     fontSize: 12,
//     color: "#8E8E93",
//   },

//   // Notes Editor (Fullscreen)
//   notesEditorContainer: {
//     flex: 1,
//     backgroundColor: "#FFFEF7",
//   },
//   notesEditorHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     backgroundColor: "#FFFEF7",
//     borderBottomWidth: 1,
//     borderBottomColor: "#F0EDD4",
//   },
//   notesEditorBackBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   notesEditorBackText: {
//     fontSize: 17,
//     color: "#007AFF",
//     marginLeft: 4,
//   },
//   notesEditorInfo: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//   },
//   notesEditorWordCount: {
//     fontSize: 14,
//     color: "#8E8E93",
//   },
//   notesEditorBody: {
//     flex: 1,
//     paddingHorizontal: 20,
//     paddingTop: 20,
//   },
//   notesEditorInput: {
//     fontSize: 17,
//     color: "#3C3C3C",
//     lineHeight: 26,
//     minHeight: 400,
//     fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
//   },
//   notesEditorToolbar: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     backgroundColor: "#FFFEF7",
//     borderTopWidth: 1,
//     borderTopColor: "#F0EDD4",
//   },
//   notesToolbarBtn: {
//     padding: 8,
//   },
//   notesToolbarDivider: {
//     width: 1,
//     height: 24,
//     backgroundColor: "#E5E5EA",
//     marginHorizontal: 12,
//   },
//   notesToolbarDate: {
//     fontSize: 13,
//     color: "#8E8E93",
//   },

//   detailInfoRow: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   detailInfoText: {
//     fontSize: 17,
//     color: "#000000",
//     marginLeft: 12,
//   },

//   // Subtask Section
//   subtaskHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   progressBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   progressText: {
//     fontSize: 15,
//     fontWeight: "600",
//     color: "#007AFF",
//     marginRight: 8,
//   },
//   progressBarContainer: {
//     width: 60,
//     height: 6,
//     backgroundColor: "#E5E5EA",
//     borderRadius: 3,
//     overflow: "hidden",
//   },
//   progressBar: {
//     height: "100%",
//     backgroundColor: "#007AFF",
//     borderRadius: 3,
//   },
//   addSubtaskRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   addSubtaskInput: {
//     flex: 1,
//     backgroundColor: "#FFFFFF",
//     borderRadius: 10,
//     padding: 12,
//     fontSize: 17,
//     color: "#000000",
//     borderWidth: 1,
//     borderColor: "#E5E5EA",
//     marginRight: 8,
//   },
//   addSubtaskIconBtn: {
//     width: 44,
//     height: 44,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   subtaskItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#FFFFFF",
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 8,
//     borderWidth: 1,
//     borderColor: "#E5E5EA",
//   },
//   subtaskCheckbox: {
//     marginRight: 12,
//   },
//   subtaskText: {
//     flex: 1,
//     fontSize: 17,
//     color: "#000000",
//   },
//   subtaskCompleted: {
//     textDecorationLine: "line-through",
//     color: "#8E8E93",
//   },
//   emptySubtasks: {
//     alignItems: "center",
//     paddingVertical: 40,
//   },
//   emptySubtasksText: {
//     fontSize: 15,
//     color: "#C7C7CC",
//     marginTop: 12,
//   },

//   // Reminder Styles
//   reminderHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     backgroundColor: "#FFFFFF",
//     borderRadius: 10,
//     padding: 16,
//     borderWidth: 1,
//     borderColor: "#E5E5EA",
//   },
//   reminderLabelRow: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   formLabelInline: {
//     fontSize: 13,
//     fontWeight: "600",
//     color: "#8E8E93",
//     letterSpacing: 0.5,
//     marginLeft: 8,
//   },
//   reminderSettings: {
//     backgroundColor: "#F9F9F9",
//     borderRadius: 10,
//     padding: 16,
//     marginTop: 12,
//   },
//   reminderSectionLabel: {
//     fontSize: 15,
//     fontWeight: "600",
//     color: "#000000",
//     marginBottom: 12,
//   },
//   reminderText: {
//     fontSize: 15,
//     color: "#000000",
//     marginBottom: 12,
//   },
//   reminderDaysRow: {
//     flexDirection: "row",
//     gap: 8,
//     marginBottom: 12,
//   },
//   reminderDayBtn: {
//     flex: 1,
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     borderRadius: 8,
//     backgroundColor: "#FFFFFF",
//     borderWidth: 1,
//     borderColor: "#E5E5EA",
//     alignItems: "center",
//   },
//   reminderDayBtnActive: {
//     backgroundColor: "#007AFF",
//     borderColor: "#007AFF",
//   },
//   reminderDayText: {
//     fontSize: 13,
//     color: "#000000",
//     fontWeight: "500",
//   },
//   reminderDayTextActive: {
//     color: "#FFFFFF",
//   },
//   customDaysContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#FFFFFF",
//     borderRadius: 10,
//     padding: 12,
//     borderWidth: 1,
//     borderColor: "#E5E5EA",
//     marginTop: 8,
//   },
//   customDaysLabel: {
//     fontSize: 14,
//     color: "#8E8E93",
//     marginRight: 8,
//   },
//   customDaysInput: {
//     width: 60,
//     height: 40,
//     backgroundColor: "#F2F2F7",
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#000000",
//     textAlign: "center",
//     marginHorizontal: 8,
//   },
//   customDaysUnit: {
//     fontSize: 14,
//     color: "#000000",
//   },
//   reminderHint: {
//     fontSize: 13,
//     color: "#8E8E93",
//     marginTop: 12,
//     lineHeight: 18,
//   },
//   timePickerBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#FFFFFF",
//     borderRadius: 10,
//     padding: 16,
//     borderWidth: 1,
//     borderColor: "#E5E5EA",
//   },
//   timePickerText: {
//     flex: 1,
//     fontSize: 17,
//     color: "#000000",
//     marginLeft: 12,
//     fontWeight: "600",
//   },
//   timePickerChevron: {
//     marginLeft: 8,
//   },

//   // Date Picker Actions
//   datePickerActions: {
//     alignItems: "flex-end",
//     paddingTop: 8,
//   },
//   datePickerDoneBtn: {
//     backgroundColor: "#007AFF",
//     paddingHorizontal: 20,
//     paddingVertical: 8,
//     borderRadius: 8,
//   },
//   datePickerDoneText: {
//     color: "#FFFFFF",
//     fontSize: 16,
//     fontWeight: "600",
//   },
// });

// import { useLocalSearchParams } from "expo-router";
// import React from "react";
// import { Text, View } from "react-native";

// const Whatever = () => {
//   const { id } = useLocalSearchParams();
//   return (
//     <View>
//       <Text>{id}</Text>
//     </View>
//   );
// };

// export default Whatever;

import { tasks } from "@/db/schema";
import { Ionicons } from "@expo/vector-icons";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { router, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSubtasks } from "../../hooks/useTasks";
import { detailStyles } from "../../styles/detailStyles";
import { modalStyles } from "../../styles/modalStyles";
import EditTaskModal from "@/components/tasks/EditTaskModal";


export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams();
  const taskId = parseInt(id as string);

  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newSubtask, setNewSubtask] = useState("");
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notesWordCount, setNotesWordCount] = useState(0);

  const x = useSQLiteContext();
  const db = drizzle(x);

  const {
    subtasks,
    createSubtask,
    toggleSubtask,
    deleteSubtask,
    refreshSubtasks,
  } = useSubtasks(taskId);

  // Load task
  const loadTask = async () => {
    try {
      const result = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, taskId))
        .limit(1);

      if (result.length > 0) {
        setTask(result[0]);
      } else {
        Alert.alert("Error", "Tugas tidak ditemukan");
        router.back();
      }
    } catch (error) {
      console.error("Error loading task:", error);
      Alert.alert("Error", "Gagal memuat tugas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTask();
  }, [taskId]);

  useEffect(() => {
    if (task?.notes) {
      const words = task.notes
        .trim()
        .split(/\s+/)
        .filter((w: string) => w.length > 0);
      setNotesWordCount(words.length);
    }
  }, [task?.notes]);

  // Auto-update status based on subtasks
  useEffect(() => {
    const updateStatus = async () => {
      if (!task || subtasks.length === 0) return;

      const completedCount = subtasks.filter((s: any) => s.completed).length;
      let newStatus = "pending";

      if (completedCount === subtasks.length) {
        newStatus = "completed";
      } else if (completedCount > 0) {
        newStatus = "in_progress";
      }

      if (newStatus !== task.status) {
        try {
          await db
            .update(tasks)
            .set({ status: newStatus, updatedAt: new Date().toISOString() })
            .where(eq(tasks.id, taskId));

          setTask({ ...task, status: newStatus });
        } catch (error) {
          console.error("Error updating status:", error);
        }
      }
    };

    updateStatus();
  }, [subtasks]);

  const handleAddSubtask = async () => {
    if (!newSubtask.trim()) {
      Alert.alert("Error", "Subtask tidak boleh kosong");
      return;
    }
    try {
      await createSubtask(newSubtask.trim());
      setNewSubtask("");
      await refreshSubtasks();
    } catch {
      Alert.alert("Error", "Gagal menambah subtask");
    }
  };

  const handleToggleSubtask = async (id: number, completed: boolean) => {
    try {
      await toggleSubtask(id, completed);
      await refreshSubtasks();
    } catch {
      Alert.alert("Error", "Gagal mengubah status");
    }
  };

  const handleDeleteSubtask = async (id: number) => {
    try {
      await deleteSubtask(id);
      await refreshSubtasks();
    } catch {
      Alert.alert("Error", "Gagal menghapus subtask");
    }
  };

  const handleUpdateTask = async (taskData: any) => {
    try {
      await db
        .update(tasks)
        .set({ ...taskData, updatedAt: new Date().toISOString() })
        .where(eq(tasks.id, taskId));

      await loadTask();
    } catch (error) {
      throw error;
    }
  };

  const handleUpdateNotes = async (newNotes: string) => {
    try {
      await db
        .update(tasks)
        .set({ notes: newNotes || null, updatedAt: new Date().toISOString() })
        .where(eq(tasks.id, taskId));

      setTask({ ...task, notes: newNotes });
    } catch (error) {
      console.error("Error updating notes:", error);
    }
  };

  if (loading || !task) {
    return (
      <SafeAreaView style={detailStyles.container}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text>Memuat...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const completedCount = subtasks.filter((s: any) => s.completed).length;
  const progress =
    subtasks.length > 0 ? (completedCount / subtasks.length) * 100 : 0;

  const statusConfig = {
    pending: { label: "Pending", color: "#FF9500", icon: "time-outline" },
    in_progress: {
      label: "Berjalan",
      color: "#007AFF",
      icon: "play-circle-outline",
    },
    completed: {
      label: "Selesai",
      color: "#34C759",
      icon: "checkmark-circle-outline",
    },
  };

  const currentStatus =
    statusConfig[task.status as keyof typeof statusConfig];

  const deadline = new Date(task.deadline);
  const isOverdue = deadline < new Date() && task.status !== "completed";

  return (
    <SafeAreaView style={detailStyles.container}>
      {/* Header */}
      <View style={detailStyles.header}>
        <View style={detailStyles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#007AFF" />
          </TouchableOpacity>
          <Text style={detailStyles.headerTitle}>Detail Tugas</Text>
        </View>
        <TouchableOpacity
          style={detailStyles.editBtn}
          onPress={() => setEditModalVisible(true)}
        >
          <Text style={detailStyles.editBtnText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={detailStyles.body} showsVerticalScrollIndicator={false}>
        {/* Status Badge */}
        <View
          style={[
            detailStyles.statusBadge,
            { backgroundColor: currentStatus.color + "20" },
          ]}
        >
          <Ionicons
            name={currentStatus.icon as any}
            size={20}
            color={currentStatus.color}
          />
          <Text
            style={[
              detailStyles.statusBadgeText,
              { color: currentStatus.color },
            ]}
          >
            {currentStatus.label}
          </Text>
        </View>

        {/* Title */}
        <Text style={detailStyles.title}>{task.title}</Text>

        {/* Description */}
        {task.description && (
          <View style={detailStyles.section}>
            <Text style={detailStyles.sectionTitle}>DESKRIPSI</Text>
            <Text style={detailStyles.sectionText}>{task.description}</Text>
          </View>
        )}

        {/* Notes */}
        {task.notes && (
          <View style={detailStyles.section}>
            <View style={detailStyles.sectionHeader}>
              <Text style={detailStyles.sectionTitle}>CATATAN</Text>
              <TouchableOpacity onPress={() => setShowNotesModal(true)}>
                <Ionicons name="pencil" size={18} color="#007AFF" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={detailStyles.notesCard}
              onPress={() => setShowNotesModal(true)}
              activeOpacity={0.7}
            >
              <Text style={detailStyles.notesText}>{task.notes}</Text>
              <View style={detailStyles.notesFooter}>
                <Text style={detailStyles.notesMeta}>{notesWordCount} kata</Text>
                <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Notes Editor Modal */}
        <Modal
          visible={showNotesModal}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setShowNotesModal(false)}
        >
          <SafeAreaView style={modalStyles.notesEditorContainer}>
            <View style={modalStyles.notesEditorHeader}>
              <TouchableOpacity
                style={modalStyles.notesEditorBackBtn}
                onPress={() => setShowNotesModal(false)}
              >
                <Ionicons name="chevron-back" size={28} color="#007AFF" />
                <Text style={modalStyles.notesEditorBackText}>Kembali</Text>
              </TouchableOpacity>
              <View style={modalStyles.notesEditorInfo}>
                <Text style={modalStyles.notesEditorWordCount}>
                  {notesWordCount} kata
                </Text>
              </View>
            </View>

            <ScrollView
              style={modalStyles.notesEditorBody}
              keyboardShouldPersistTaps="handled"
            >
              <TextInput
                style={modalStyles.notesEditorInput}
                value={task.notes || ""}
                onChangeText={handleUpdateNotes}
                placeholder="Mulai menulis catatan Anda..."
                placeholderTextColor="#C7C7CC"
                multiline
                autoFocus
                textAlignVertical="top"
              />
            </ScrollView>

            <View style={modalStyles.notesEditorToolbar}>
              <TouchableOpacity
                style={modalStyles.notesToolbarBtn}
                onPress={() => handleUpdateNotes("")}
              >
                <Ionicons name="trash-outline" size={24} color="#FF3B30" />
              </TouchableOpacity>
              <View style={modalStyles.notesToolbarDivider} />
              <Text style={modalStyles.notesToolbarDate}>
                {new Date().toLocaleString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          </SafeAreaView>
        </Modal>

        {/* Deadline */}
        <View style={detailStyles.section}>
          <Text style={detailStyles.sectionTitle}>DEADLINE</Text>
          <View style={detailStyles.infoRow}>
            <Ionicons
              name="calendar-outline"
              size={20}
              color={isOverdue ? "#FF3B30" : "#007AFF"}
            />
            <Text
              style={[
                detailStyles.infoText,
                isOverdue && { color: "#FF3B30", fontWeight: "600" },
              ]}
            >
              {deadline.toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              {isOverdue && " (Terlambat)"}
            </Text>
          </View>
        </View>

        {/* Reminder Info */}
        {task.reminderEnabled && (
          <View style={detailStyles.section}>
            <Text style={detailStyles.sectionTitle}>PENGINGAT</Text>
            <View style={detailStyles.reminderInfo}>
              <Ionicons name="notifications" size={20} color="#007AFF" />
              <Text style={detailStyles.reminderInfoText}>
                {task.reminderDaysBefore === 0
                  ? "Pada hari yang sama"
                  : `${task.reminderDaysBefore} hari sebelumnya`}{" "}
                pukul {task.reminderTime}
              </Text>
            </View>
          </View>
        )}

        {/* Subtasks */}
        <View style={detailStyles.section}>
          <View style={detailStyles.subtaskHeader}>
            <Text style={detailStyles.sectionTitle}>SUBTASK</Text>
            {subtasks.length > 0 && (
              <View style={detailStyles.progressBadge}>
                <Text style={detailStyles.progressText}>
                  {completedCount}/{subtasks.length}
                </Text>
                <View style={detailStyles.progressBarContainer}>
                  <View
                    style={[detailStyles.progressBar, { width: `${progress}%` }]}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Add Subtask */}
          <View style={detailStyles.addSubtaskRow}>
            <TextInput
              style={detailStyles.addSubtaskInput}
              value={newSubtask}
              onChangeText={setNewSubtask}
              placeholder="Tambah subtask baru..."
              placeholderTextColor="#C7C7CC"
              onSubmitEditing={handleAddSubtask}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={detailStyles.addSubtaskIconBtn}
              onPress={handleAddSubtask}
            >
              <Ionicons name="add-circle" size={32} color="#007AFF" />
            </TouchableOpacity>
          </View>

          {/* Subtask List */}
          {subtasks.map((subtask: any) => (
            <View key={subtask.id} style={detailStyles.subtaskItem}>
              <TouchableOpacity
                style={detailStyles.subtaskCheckbox}
                onPress={() =>
                  handleToggleSubtask(subtask.id, subtask.completed ? 0 : 1)
                }
                activeOpacity={0.7}
              >
                <Ionicons
                  name={
                    subtask.completed ? "checkmark-circle" : "ellipse-outline"
                  }
                  size={24}
                  color={subtask.completed ? "#34C759" : "#C7C7CC"}
                />
              </TouchableOpacity>
              <Text
                style={[
                  detailStyles.subtaskText,
                  subtask.completed && detailStyles.subtaskCompleted,
                ]}
              >
                {subtask.title}
              </Text>
              <TouchableOpacity
                onPress={() => handleDeleteSubtask(subtask.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          ))}

          {subtasks.length === 0 && (
            <View style={detailStyles.emptySubtasks}>
              <Ionicons name="list-outline" size={48} color="#C7C7CC" />
              <Text style={detailStyles.emptySubtasksText}>
                Belum ada subtask
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Edit Modal */}
      <EditTaskModal
        visible={editModalVisible}
        onClose={() => {
          setEditModalVisible(false);
          loadTask();
        }}
        task={task}
        onUpdate={handleUpdateTask}
      />
    </SafeAreaView>
  );
}