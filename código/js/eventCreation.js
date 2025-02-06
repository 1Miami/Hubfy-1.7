document.addEventListener('DOMContentLoaded', async () => {
    
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const userResponse = await fetch('http://localhost:3000/user', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const userData = await userResponse.json(); // Dados do usuário logado

    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('eventId');
    const form = document.getElementById('eventRegisterForm');
    const messageElement = document.getElementById('message');

    let isEditing = false;
    let eventData = {};
    
    if (eventId) {
        isEditing = true;
        document.querySelector('h2').textContent = 'Editar Evento';
        document.querySelector('button[type="submit"]').textContent = 'Salvar Alterações';

        try {
            const response = await fetch(`http://localhost:3000/eventId?id=${eventId}`);
            if (!response.ok) throw new Error(`Erro: ${response.statusText}`);
            
            eventData = await response.json();

            // 🔴 Verifica se o usuário é o organizador do evento
            if (eventData.organizer_id !== userData.id) {
                window.location.href = 'home.html';
                return;
            }

            document.getElementById('name').value = eventData.name;
            document.getElementById('description').value = eventData.description;
            document.getElementById('event_type').value = eventData.event_type;
            document.getElementById('participants').value = eventData.participants;
            document.getElementById('event_date').value = eventData.event_date.split('T')[0];
            document.getElementById('event_time').value = eventData.event_time;
            document.getElementById('cep').value = eventData.CEP;
            document.getElementById('phone_number').value = eventData.phone_number;
            
            if (eventData.image) {
                document.getElementById('previewImage').innerHTML = `<img src="http://localhost:3000/eventImage/${eventId}" alt="Imagem do evento" style="width: 80%;">`;
            }
        } catch (error) {
            console.error(error);
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const description = document.getElementById('description').value;
        const event_type = document.getElementById('event_type').value;
        const participants = document.getElementById('participants').value;
        const event_date = document.getElementById('event_date').value;
        const event_time = document.getElementById('event_time').value;
        const CEP = document.getElementById('cep').value;
        const phone_number = document.getElementById('phone_number').value;
        const imageInput = document.getElementById('image');
        
        const formData = new FormData();
        formData.append(isEditing ? 'newName' : 'name', name);
        formData.append(isEditing ? 'sameOrganizerId' : 'organizer_id', userData.id);
        formData.append(isEditing ? 'newDescription' : 'description', description);
        formData.append(isEditing ? 'newEvent_Type' : 'event_type', event_type);
        formData.append(isEditing ? 'newParticipants' : 'participants', participants);
        formData.append(isEditing ? 'newEvent_Date' : 'event_date', event_date);
        formData.append(isEditing ? 'newEvent_Time' : 'event_time', event_time);
        formData.append(isEditing ? 'newCep' : 'CEP', CEP);
        formData.append(isEditing ? 'newPhoneNumber' : 'phone_number', phone_number);
        
        if (isEditing) {
            formData.append('event_id', eventId);
        }

        if (imageInput.files.length > 0) {
            formData.append('image', imageInput.files[0]);
        }

        const url = isEditing ? 'http://localhost:3000/editEvent' : 'http://localhost:3000/eventRegister';
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            
            if (response.ok) {
                messageElement.textContent = isEditing ? 'Evento atualizado com sucesso!' : 'Evento registrado com sucesso!';
                window.location.href = 'user.html'; 

            } else {
                messageElement.textContent = await response.text();
            }
        } catch (error) {
            messageElement.textContent = 'Erro ao processar a requisição.';
            console.error(error);
            
        }
    });

    document.getElementById('event_date').addEventListener('input', function() {
        const today = new Date().toISOString().split('T')[0];
        if (this.value < today) {
            alert('A data do evento não pode ser em um dia anterior ao atual!');
            this.value = '';
        }
    });
});
