import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { MaterialIcons } from '@expo/vector-icons';
import apiClient, { API_BASE_URL } from '../services/api';
import { useAuth } from '../AuthContext';

const MaintenanceScreen = () => {
    const [requests, setRequests] = useState([]);
    const [residentName, setResidentName] = useState('');
    const [requestType, setRequestType] = useState(null);
    const [description, setDescription] = useState('');
    const [openDropdown, setOpenDropdown] = useState(false);
    const { token, logout } = useAuth();

    const requestTypes = [
        { label: 'Maintenance', value: 'Maintenance', icon: () => <MaterialIcons name="build" size={20} color="black" /> },
        { label: 'Housekeeping', value: 'Housekeeping', icon: () => <MaterialIcons name="home" size={20} color="black" /> }
    ];

    useEffect(() => {
        fetchRequests();
    }, [token]);

    const fetchRequests = async () => {
        try {
            const response = await apiClient.get('/maintenance/', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setRequests(response.data);
        } catch (error) {
            handleApiError(error);
        }
    };

    const submitRequest = async () => {
        if (!residentName || !requestType || !description) {
            Alert.alert('Form Error', 'Please fill in all fields!');
            return;
        }

        const newRequest = {
            resident_name: residentName,
            request_type: requestType,
            description,
            status: 'Pending'
        };

        try {
            await apiClient.post('/maintenance/', newRequest, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchRequests();
            setResidentName('');
            setRequestType(null);
            setDescription('');
        } catch (error) {
            handleApiError(error);
        }
    };

    const handleApiError = (error) => {
        if (error.response && error.response.status === 401) {
            Alert.alert("Session Expired", "Your session has expired, please log back in.", [
                { text: "OK", onPress: logout }
            ]);
        } else {
            Alert.alert('Error', 'An unexpected error occurred.');
        }
    };

    const getStatusStyle = (status) => status === 'Completed' ? styles.statusCompleted : styles.statusPending;

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Maintenance Requests</Text>
            <FlatList
                data={requests}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>{item.request_type === 'Housekeeping' ? '🏠' : '🔧'} {item.request_type}</Text>
                        <Text>{item.description}</Text>
                        <Text>Status: <Text style={getStatusStyle(item.status)}>{item.status}</Text></Text>
                        <Text>Submitted by: {item.resident_name}</Text>
                        <Text>Created At: {new Date(item.created_at).toLocaleString()}</Text>
                    </View>
                )}
            />

            <Text style={styles.formHeader}>Submit a New Request</Text>
            <TextInput style={styles.input} placeholder="Resident Name" value={residentName} onChangeText={setResidentName} />

            <DropDownPicker
                open={openDropdown}
                value={requestType}
                items={requestTypes}
                setOpen={setOpenDropdown}
                setValue={setRequestType}
                placeholder="Select Request Type"
                style={styles.dropdown}
            />

            <TextInput style={styles.input} placeholder="Description" value={description} onChangeText={setDescription} />

            <TouchableOpacity style={styles.submitButton} onPress={submitRequest}>
                <Text style={styles.submitButtonText}>SUBMIT REQUEST</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#F3F3E7' },
    header: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
    card: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 10, shadowOpacity: 0.1, shadowRadius: 4 },
    cardTitle: { fontSize: 18, fontWeight: 'bold' },
    statusPending: { color: 'orange', fontWeight: 'bold' },
    statusCompleted: { color: 'green', fontWeight: 'bold' },
    formHeader: { fontSize: 18, fontWeight: 'bold', marginTop: 20 },
    input: { backgroundColor: 'white', padding: 10, borderRadius: 5, marginTop: 10 },
    dropdown: { marginTop: 10 },
    submitButton: { backgroundColor: '#007AFF', padding: 12, borderRadius: 5, marginTop: 10, alignItems: 'center' },
    submitButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});

export default MaintenanceScreen;
