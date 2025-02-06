let activeEvents =[];
let pastEvents =[];
let userData = 0;
let page = 1;
let honorParticipants = [];
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Requisição para obter os dados do usuário autenticado
    const userResponse = await fetch('http://localhost:3000/user', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}` // Certifique-se de que o token está sendo enviado
        }
    });

    if (userResponse.ok) {
        userData = await userResponse.json(); // userData se mantém salvo
        console.log("seu id: ", userData.id);

        // Requisição para a rota /userEvents
        const eventsResponse = await fetch(`http://localhost:3000/userEvents?userId=${userData.id}`, {
            method: 'GET'
        });

        

        if (eventsResponse.ok) {
             const eventsData = await eventsResponse.json();
    const now = new Date();

    console.log("Eventos do usuário:", eventsData.allEvents);

    for (const event of eventsData.allEvents) {
        const eventDate = new Date(event.event_date); // Apenas a data
        const eventTime = event.event_time; // Horário no formato "HH:mm:ss"

        if (isNaN(eventDate.getTime())) {
            console.warn("Data inválida encontrada:", event.event_date);
            continue; // Ignorar eventos com datas inválidas
        }

        // Dividir o tempo em horas, minutos e segundos para montar a data completa
        const [hours, minutes, seconds] = eventTime.split(':').map(Number);
        eventDate.setHours(hours, minutes, seconds); // Adiciona o horário à data

        console.log("Data e hora do evento (convertida):", eventDate);

        if (eventDate < now) {
            pastEvents.push(event); // Evento já aconteceu
        } else {
            activeEvents.push(event); // Evento ainda ativo
        }
            }
            console.log(activeEvents[0])
            
                
           

            console.log("Eventos passados:", pastEvents);
            console.log("Eventos ativos:", activeEvents);
        } else {
            console.error("Erro ao buscar eventos do usuário.");
        }
    } else {
        console.log('Erro ao obter dados do usuário.');
    }
    renderCards(0);
    
});//fim do DOMContentLoaded

async function renderCards(action){
    let pageQuantity = pastEvents.length/6
    
    
    for(let index = 0; index < activeEvents.length;index++){//carrega eventos programados
        let label = "ver";
        if(activeEvents[index].organizer_id == userData.id){
            label = "editar";
        }
        
        const cepData = await cepSearch(activeEvents[index].CEP);
        
        const data = activeEvents[index].event_date.slice(0, -14);
        const partes = data.split("-")

        document.getElementById(`activeCard${index}`).innerHTML = `
        <h3 id="activeName0">${activeEvents[index].name}</h3>
                    <div class="divide">
                        <p  id="activeType0"><strong>Tipo:</strong>${activeEvents[index].event_type}</p>
                    </div>
                    <div class="divide">
                        <p id="activeDate0"><strong>Data:</strong> ${partes[2]+"/"+partes[1]+"/"+partes[0]}</p>
                        <p id="activeTime0"><strong>Hora:</strong> ${activeEvents[index].event_time.slice(0, -3)}</p>
                    </div>
                    <p id="activeAddress0"><strong>Endereço:</strong> ${cepData.bairro+" - "+cepData.localidade+" - "+cepData.uf}</p>
                    <button id="activeButton${index}" value='${JSON.stringify([index, activeEvents[index].organizer_id])}' onclick="entrarCardEvento(this)">${label}</button>
    `;
    document.getElementById(`activeCard${index}`).style.display = "flex";
    document.getElementById(`createIcon${index}`).style.display = "none"
    }
    if(pastEvents.length < 7){
        document.getElementById("next").disabled = true;
    }
    switch(action){
        case 0:
        if(page==1 ){
            document.getElementById("back").disabled = true;
        }else if(page-1==1){
            document.getElementById("back").disabled = true;
            page = page-1
        }
        
        else{
            page = page -1;
            document.getElementById("next").disabled = false;
        }
        
        if(pastEvents.length ==0){
            document.getElementById("next").disabled = true;
        }
        break;
        case 1:
            if(!pastEvents[6*(page+1)]){
                document.getElementById("next").disabled = true;
            }
            page = page + 1;
            document.getElementById("back").disabled = false;
        break;
    }

    for(let index2 = (6*page)-6, index = 0; index < 6 ;index++, index2++){//carrega cada evento que já
        if(!pastEvents[index2]){
            document.getElementById(`pastCard${index}`).innerHTML = `
            
        `;
        }
        else{

                
                const cepData = await cepSearch(pastEvents[index2].CEP);
                
                const data = pastEvents[index2].event_date.slice(0, -14);
                const partes = data.split("-")

                document.getElementById(`pastCard${index}`).innerHTML = `
                <h3 id="activeName0">${pastEvents[index2].name}</h3>
                            <div class="divide">
                                <p  id="activeType0"><strong>Tipo:</strong>${pastEvents[index2].event_type}</p>
                            </div>
                            <div class="divide">
                                <p id="activeDate0"><strong>Data:</strong> ${partes[2]+"/"+partes[1]+"/"+partes[0]}</p>
                                <p id="activeTime0"><strong>Hora:</strong> ${pastEvents[index2].event_time.slice(0, -3)}</p>
                            </div>
                            <p id="activeAddress0"><strong>Endereço:</strong> ${cepData.bairro+" - "+cepData.localidade+" - "+cepData.uf}</p>
                            <button id="pastButton${index2}" value='${JSON.stringify([index2, pastEvents[index2].organizer_id])}' onclick="entrarCardEvento(this)">ver</button>
            `;
            
            }
        }
        if(pastEvents.length/6 != parseInt(pastEvents.length/6)){
            pageQuantity = parseInt(pastEvents.length/6) +1
        }//Determina o número total de página para preencher o contador de páginas da página
        document.getElementById("pageNumber").textContent = `${page}/${pageQuantity}`
}

function entrarCardEvento(button){
    const values = JSON.parse(button.value); // Converte a string JSON de volta para array
    const index = values[0]; // Pega o índice correto

    document.getElementById('backgroundLocker').style.display = "flex";
    
    if(button.id.startsWith('activeButton')){
        document.getElementById('rateOrganizer').style.display = "none";
        document.getElementById('participantsHonor').style.display = "none";
        document.getElementById('backgroundLocker').style.justifyContent = "center";

        renderActiveCard(button);
    } else {
        renderPastCard(index, values[1]); // Passa o índice correto e o organizer_id
    }
}
async function renderPastCard(index, organizerId) {
    console.log("Índice recebido:", index);
    console.log("Evento encontrado:", pastEvents[index]);

    if (!pastEvents[index]) {
        console.error(`Erro: Não existe pastEvents[${index}]`);
        return;
    }

    // Exibir elementos corretos
    if(organizerId != userData.id){
        let exists = false;
        document.getElementById('rateOrganizer').style.display = "flex";
        document.getElementById('stars').value = organizerId;
        const ratingsResponse = await fetch(`http://localhost:3000/getRatings?userId=${organizerId}`, {
            method: 'GET'
        });
        
        let ratingsResult = await ratingsResponse.json();
        for(let i = 0;i<ratingsResult.ratings.length;i++){
            if(ratingsResult.ratings[i].rating_user_id!=userData.id){
                continue;
            }else{
                changeRating(ratingsResult.ratings[i].rating_value)
                document.getElementById('comment').value = ratingsResult.ratings[i].comment
            }
            
        }
    
    }else{
        document.getElementById('rateOrganizer').style.display = "none";
    }

    document.getElementById('participantsHonor').style.display = "flex";
    document.getElementById('backgroundLocker').style.justifyContent = "space-evenly";

    // Buscar dados dos participantes
    const participantsData2 = await participantsInfo(pastEvents[index].id);
    console.log("Participantes:", participantsData2.result);
    fillHonorCards(participantsData2.result);

    // Buscar CEP
    const cepData = await cepSearch(pastEvents[index].CEP);
    console.log("CEP encontrado:", cepData);

    // Formatar data
    const data = pastEvents[index].event_date.slice(0, -14);
    const partes = data.split("-");

    // Buscar quantidade de participantes
    const participantsData = await participantsQuantity(pastEvents[index].id);

    // Buscar nome do organizador usando organizerId (corrigido)
    const userIdResponse = await fetch(`http://localhost:3000/userId?id=${organizerId}`);
    if (!userIdResponse.ok) {
        throw new Error(`Erro ao buscar organizador: ${userIdResponse.statusText}`);
    }
    const organizerData = await userIdResponse.json();
    console.log("Organizador encontrado:", organizerData);
    const imageUrl = `http://localhost:3000/eventImage/${pastEvents[index].id}`;
    // Atualizar o card com os dados
    document.getElementById("card").innerHTML = `
    <button onclick="closeCards()">fechar</button>
        <h3>${pastEvents[index].name}</h3>
        <img style="width:80%;" src="${imageUrl}" alt="Sua Foto">
        
            
            <textarea readonly style="resize: none;width: 90%;height:15%;display:flex" 
                  id="description" name="description" required maxlength="500">${pastEvents[index].description}</textarea>
                  <a style="color: black; font-size:2rem" href="../html/userInfo.html?id=${organizerData.id}&name=${organizerData.name}">${organizerData.name}</a>
        <p>${pastEvents[index].event_type}</p>
        <div class="divide">
            <p><strong>Data:</strong> ${partes[2]}/${partes[1]}/${partes[0]}</p>
            <p><strong>Hora:</strong> ${pastEvents[index].event_time.slice(0, -3)}</p>
        </div>
        <p>Participantes: ${participantsData.participants}/${pastEvents[index].participants}</p>
        <a href="https://api.whatsapp.com/send?phone=55${pastEvents[index].phone_number.replace(/[()]/g, "").trim()}">Entrar em contato</a>
        <p><strong>Endereço:</strong> ${cepData.bairro} - ${cepData.localidade} - ${cepData.uf}</p>
    `;

    console.log("Card atualizado com sucesso!");
}
async function renderActiveCard(button) {
    const values = JSON.parse(button.value);
    const index = values[0];
    const organizerId = values[1];

    if (!activeEvents[index]) {
        console.error(`Erro: Evento não encontrado no índice ${index}`);
        return;
    }

    const cepData = await cepSearch(activeEvents[index].CEP);
    const participantsData = await participantsQuantity(activeEvents[index].id);
    const data = activeEvents[index].event_date.split("T")[0];
    const imageUrl = `http://localhost:3000/eventImage/${activeEvents[index].id}`;

    let organizerName = "";
    if (organizerId !== userData.id) {
        const organizerData = await (await fetch(`http://localhost:3000/userId?id=${organizerId}`)).json();
        organizerName = `<a style="color: black; font-size:2rem" href="../html/userInfo.html?id=${organizerData.id}&name=${organizerData.name}">${organizerData.name}</a>`;
    }

    document.getElementById(`card`).innerHTML = `
        <button onclick="closeCards()">fechar</button>
        <h3 id="activeName0">${activeEvents[index].name}</h3>
        <img style="width:80%;" src="${imageUrl}" alt="Sua Foto">
        <textarea readonly style="resize: none;width: 90%;height:15%;display:flex" id="description" name="description" maxlength="500">${activeEvents[index].description}</textarea>
        ${organizerName}
        <p>${activeEvents[index].event_type}</p>
        <div class="divide">
            <p><strong>Data:</strong> ${data.split("-").reverse().join("/")}</p>
            <p><strong>Hora:</strong> ${activeEvents[index].event_time.slice(0, -3)}</p>
        </div>
        <p>Participantes: ${participantsData.participants}/${activeEvents[index].participants}</p>
        <a href="https://api.whatsapp.com/send?phone=55${activeEvents[index].phone_number.replace(/[()]/g, "").trim()}">Entrar em contato</a>
        <p><strong>Endereço:</strong> ${cepData.bairro} - ${cepData.localidade} - ${cepData.uf}</p>
        ${organizerId === userData.id ? `
            <button onclick="redirect(${activeEvents[index].id})">Editar</button>
            <button onclick="deleteEvent(${activeEvents[index].id})">Excluir</button>
        ` : `<button onclick="deleteUserEvent(${index})">Sair</button>`}
    `;
}

async function cepSearch(cep){
 
    const cepResponse = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!cepResponse.ok) {
        throw new Error(`Erro ao buscar CEP: ${cepResponse.statusText}`);
    }
    const cepData = await cepResponse.json();

    
    return cepData
}

async function participantsQuantity(groupId){
    const participantsResponse = await fetch(`http://localhost:3000/participants?groupId=${groupId}`);
        if (!participantsResponse.ok) {
            throw new Error(`Erro: ${participantsResponse.statusText}`);
        }
        participantsData = await participantsResponse.json();

        return participantsData
}

  document.getElementById('card').addEventListener('submit', async (e) => {
    if (e.target && e.target.id === 'editForm') {
    e.preventDefault();
        const token = localStorage.getItem('token');
        const name = document.getElementById('name').value;
        const description = document.getElementById('description').value;
        const event_type = document.getElementById('event_type').value;
        const participants = document.getElementById('participants').value;
        const event_date = document.getElementById('event_date').value;
        const event_time = document.getElementById('event_time').value;
        const CEP = document.getElementById('cep').value;
        const phone_number = document.getElementById('phone_number').value;
        const groupId = document.getElementById("deleteButton").value;
        const updateResponse = await fetch('http://localhost:3000/editEvent', {
            method: 'PUT', // Método HTTP PUT para atualização
            headers: {
                'Content-Type': 'application/json', // Define o tipo de conteúdo como JSON
                'Authorization': `Bearer ${token}` // Envia o token no cabeçalho para autenticação
            },
            body: JSON.stringify({ newName: name , newDescription: description, newEvent_Type: event_type, newParticipants: participants , newEvent_Date: event_date, newEvent_Time: event_time , newCep: CEP, newPhoneNumber: phone_number, event_id: groupId  }) // Envia os novos dados no corpo da requisição
            //newName, newDescription, newEvent_Type, newParticipants, newEvent_Date, newEvent_Time, newCep, newPhoneNumber, organizer_id
        });
        
        

        console.log(document.getElementById("deleteButton").value)
        location.reload();
    }
  });

  async function deleteEvent(id){
    const deleteResponse = await fetch('http://localhost:3000/event', {
        method: 'DELETE', // Método HTTP DELETE
        headers: {
          'Content-Type': 'application/json', // Tipo do conteúdo enviado
        },
        body: JSON.stringify({ eventId: id }), // Corpo da requisição enviado como JSON
      });
    
    location.reload()
  }
  async function deleteUserEvent(eventIndex) {
    
    try {
        const response = await fetch('http://localhost:3000/leaveEvent', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id: userData.id, event_id: activeEvents[eventIndex].id }),
          });
  
      const result = await response.json();
  
      if (!response.ok) {
        console.error('Erro:', result);
        return;
      }
  
      console.log('Sucesso:', result.message);
      location.reload();
    } catch (error) {
      console.error('Erro na requisição:', error);
    }
  }
 
async function participantsInfo(groupId){
const participantsResponse = await fetch(`http://localhost:3000/participantsInfo?groupId=${groupId}`);
        if (!participantsResponse.ok) {
            throw new Error(`Erro: ${participantsResponse.statusText}`);
        }
        participantsData = await participantsResponse.json();

        return participantsData
}
  
async function fillHonorCards(participants){
    document.querySelectorAll('.honorCard').forEach(div => div.remove());
    honorParticipants = participants;
    for(let i = 0;i<participants.length;i++){
        if(participants[i].id == userData.id){

        }else{
        const allHonorResponse = await fetch(`http://localhost:3000/honorInfo?id=${participants[i].id}`, {
            method: 'GET'
        });

        honorData = await allHonorResponse.json();
        if(honorData.leadership_honors==null){
            honorData.leadership_honors = 0
        }
        if(honorData.sociable_honors==null){
            honorData.sociable_honors = 0
        }
        if(honorData.participative_honors==null){
            honorData.participative_honors = 0
        }
        const div = document.createElement('div');
        div.classList.add('honorCard');
        div.id = `honorCard${i}`
        div.innerHTML = `
            <h3>${participants[i].name}</h3>
            
            <div class="honorImages"> 
            <button onclick="changeHonor(${participants[i].id},'leadership')"><img src="../src/lider.png" title="Liderança"></button>
            </div>
            <h2>${honorData.leadership_honors}</h2>
            <div class="honorImages"> 
            <button onclick="changeHonor(${participants[i].id},'sociable')"><img src="../src/sociavel.png" title="Sociável"></button>
            </div>
            <h2>${honorData.sociable_honors}</h2>
            <div class="honorImages"> 
               <button onclick="changeHonor(${participants[i].id},'participative')"><img src="../src/participativo.png" title="Participativo"></button>
            </div>
             <h2>${honorData.participative_honors}</h2>
        `;
        
        document.getElementById("participantsHonor").appendChild(div); 
    }
    }
    
    
}
async function changeHonor(honoredId, honor_type){
    
    const honorResponse = await fetch(`http://localhost:3000/checkHonor?fromUserId=${userData.id}&toUserId=${honoredId}&honorType=${honor_type}`, {
        method: 'GET'
    });
    
    let honorResult = await honorResponse.json();
    if(honorResult.exists){
        
        const response = await fetch('http://localhost:3000/deleteHonor', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fromUserId: userData.id, toUserId:honoredId, honorType:honor_type }),
          });
  
      const result = await response.json();
    
    }else{
        const response = await fetch('http://localhost:3000/addHonor', {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
    
            body: JSON.stringify({ fromUserId: userData.id, toUserId:honoredId, honorType:honor_type })
        });
        const result = await response.json();
    }
    fillHonorCards(honorParticipants);
}
async function changeRating(button) {
    let rating
    if(button.value){
        rating = parseInt(button.value); // Converte para número
    }else{
        rating = button
    }
    
    
    document.getElementById('finishRatingBtn').value = rating
    
    for (let i = 1; i <= 5; i++) {
        document.getElementById(`star${i}`).src = '../src/blankStar.png';
    }
    for (let i = 1; i <= rating; i++) {
        document.getElementById(`star${i}`).src = '../src/yellowStar.png';
    }
}
async function rate(button){
    let ratedId =document.getElementById('stars').value
    let userComment = document.getElementById('comment').value
    let ratingValue = button.value;
    let exists = false
    console.log(ratedId, userComment, ratingValue, userData.id)
    

    const ratingsResponse = await fetch(`http://localhost:3000/getRatings?userId=${ratedId}`, {
        method: 'GET'
    });
    
    let ratingsResult = await ratingsResponse.json();
    for(let i = 0;i<ratingsResult.ratings.length;i++){
        if(ratingsResult.ratings[i].rating_user_id!=userData.id){
            continue;
        }else{
            exists=true
        }
    }

    if(exists){
        
        const response = await fetch('http://localhost:3000/editRating', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }, 
            body: JSON.stringify({ fromUserId: userData.id, toUserId: ratedId, rating: ratingValue, comment: userComment })  
        });
        const result = await response.json();
    }else{

        const response = await fetch('http://localhost:3000/addRating', {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
    
            body: JSON.stringify({ fromUserId: userData.id, toUserId:ratedId, rating:ratingValue, comment:userComment })
        });
        const result = await response.json();
        console.log(result)
    }
    fillHonorCards(honorParticipants)

}
async function fetchUserImage(userId) {
    try {
        const response = await fetch(`http://localhost:3000/userImage/${userId}`);
        if (response.ok) {
            const blob = await response.blob();
            return URL.createObjectURL(blob); // Retorna a URL gerada
        } else {
            console.error('Erro ao buscar a imagem:', response.statusText);
            return "../src/defaultUser.png"; // Imagem padrão caso ocorra erro
        }
    } catch (error) {
        console.error('Erro ao buscar a imagem:', error);
        return "../src/sociavel.png"; // Imagem padrão em caso de erro
    }
}
function closeCards(){
    location.reload();
}
function redirect(eventId){
    window.location.href = `eventCreation.html?eventId=${eventId}`;
}