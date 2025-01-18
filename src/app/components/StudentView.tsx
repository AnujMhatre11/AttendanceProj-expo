import React, { useContext, useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { fetchStudentInfo, getActiveSessionsForStudent } from '../api/useGetData';
import { UserContext } from '../context/UserContext';

const StudentView = () => {
  const router = useRouter();
  const [studentInfo, setStudentInfo] = useState(null);
  const [activeSessions, setActiveSessions] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchData = async () => {
      const info = await fetchStudentInfo();
      setStudentInfo(info || null);
    };
    fetchData();
  }, [user]);

  const checkActiveSessions = useCallback(async () => {
    if (studentInfo) {
      const sessions = await getActiveSessionsForStudent(studentInfo);
      setActiveSessions(sessions || []);
    }
  }, [studentInfo]);

  useEffect(() => {
    const pollActiveSessions = setInterval(checkActiveSessions, 5000);
    return () => clearInterval(pollActiveSessions);
  }, [checkActiveSessions]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await checkActiveSessions();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSessionClick = (session) => {
    router.push({
      pathname: '/components/StudentMarkingAttendance',
      params: { sessionId: session.session_id, facultyId: session.faculty_id, subjectName: session.subject.subject_name },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Active Sessions</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={isRefreshing}
        >
          <Text style={styles.refreshButtonText}>
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Text>
        </TouchableOpacity>
      </View>

      {activeSessions.length === 0 ? (
        <Text style={styles.noSessions}>No active attendance sessions</Text>
      ) : (
        <FlatList
          data={activeSessions}
          keyExtractor={(item) => item.session_id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.sessionCard}
              onPress={() => handleSessionClick(item)}
            >
              <Text style={styles.subjectName}>{item.subject.subject_name}</Text>
              <Text style={styles.sessionDetails}>
                {`Started at: ${new Date(item.start_time).toLocaleTimeString()}`}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9' },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  header: { fontSize: 24, fontWeight: 'bold' },
  refreshButton: { backgroundColor: '#007AFF', padding: 8, borderRadius: 8 },
  refreshButtonText: { color: '#fff', fontSize: 14, fontWeight: '500' },
  noSessions: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 20 },
  sessionCard: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 12 },
  subjectName: { fontSize: 18, fontWeight: 'bold' },
  sessionDetails: { fontSize: 14, color: '#666', marginTop: 4 },
});
