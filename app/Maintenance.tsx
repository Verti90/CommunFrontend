import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../AuthContext';

const API_BASE_URL = 'http://192.168.4.91:8000/api'; // Make this easily configurable later

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
    }, [token, logout]);

    const fetchRequests = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/maintenance/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setRequests(response.data);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                // Handle token expiration or invalid token
                Alert.alert(
                    "Session Expired",
                    "Your session has expired, please log back in.",
                    [
                        {
                            text: "OK",
                            onPress: () => {
                                logout();
                            }
                        }
                    ]
                );
            } else {
                console.error('Error fetching maintenance requests:', error);
                if (error.response) {
                    console.error('Response data:', error.response.data); // Log response data
                    console.error('Response status:', error.response.status); // Log response status
                }
            }
        }
    };

    const submitRequest = async () => {
        if (!residentName || !requestType || !description) {
            alert('Please fill in all fields!');
            return;
        }

        const newRequest = {
            resident_name: residentName,
            request_type: requestType,
            description,
            status: 'Pending' // Always set to pending on submission
        };

        try {
            await axios.post(`${API_BASE_URL}/maintenance/`, newRequest, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchRequests(); // Refresh the list
            setResidentName('');
            setRequestType(null);
            setDescription('');
        } catch (error) {
            if (error.response && error.response.status === 401) {
                // Handle token expiration or invalid token
                Alert.alert(
                    "Session Expired",
                    "Your session has expired, please log back in.",
                    [
                        {
                            text: "OK",
                            onPress: () => {
                                logout();
                            }
                        }
                    ]
                );
            } else {
                console.error('Error submitting request:', error);
                if (error.response) {
                    console.error('Response data:', error.response.data); // Log response data
                    console.error('Response status:', error.response.status); // Log response status
                }
            }
        }
    };

    const getStatusStyle = (status) => {
        return status === 'Completed' ? styles.statusCompleted : styles.statusPending;
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Maintenance Requests</Text>
            <FlatList
                data={requests}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>
                            {item.request_type === 'Housekeeping' ? '🏠 ' : '🔧 '}
                            {item.request_type}
                        </Text>
                        <Text>{item.description}</Text>
                        <Text>Status: <Text style={getStatusStyle(item.status)}>{item.status}</Text></Text>
                        <Text>Submitted by: {item.resident_name}</Text>
                        <Text>Created At: {new Date(item.created_at).toLocaleString()}</Text>
                    </View>
                )}
            />

            <Text style={styles.formHeader}>Submit a New Request</Text>
            <TextInput
                style={styles.input}
                placeholder="Resident Name"
                value={residentName}
                onChangeText={setResidentName}
            />

            <DropDownPicker
                open={openDropdown}
                value={requestType}
                items={requestTypes}
                setOpen={setOpenDropdown}
                setValue={setRequestType}
                placeholder="Select Request Type"
                style={styles.dropdown}
            />

            <TextInput
                style={styles.input}
                placeholder="Description"
                value={description}
                onChangeText={setDescription}
            />

            <TouchableOpacity style={styles.submitButton} onPress={submitRequest}>
                <Text style={styles.submitButtonText}>SUBMIT REQUEST</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#F3F3E7' }, // Updated background color
    header: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
    card: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
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
