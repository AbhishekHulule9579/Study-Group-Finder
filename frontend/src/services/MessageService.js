import axios from 'axios';

const API_BASE_URL = 'http://localhost:8145';

class MessageService {
    static async deleteMessage(groupId, messageId, token) {
        try {
            const response = await axios.delete(
                `${API_BASE_URL}/api/groups/${groupId}/messages/${messageId}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async sendMessage(groupId, message, token) {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/groups/${groupId}/messages`,
                message,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async uploadDocument(groupId, file, token) {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/groups/${groupId}/messages/document`,
                formData,
                {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

export default MessageService;