const urlParams = new URLSearchParams(window.location.search);
const thisId = urlParams.get('id');
const thisName = urlParams.get('name');
document.addEventListener('DOMContentLoaded', async () => {
   document.getElementById('userName').textContent = thisName
    const token = localStorage.getItem('token'); 
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    // Seleciona os elementos onde as informações do usuário e mensagens serão exibidas
   const messageElement = document.getElementById('message');
    // Realiza uma requisição para obter os dados do usuário autenticado
    const response = await fetch('http://localhost:3000/user', {
      method: 'GET',
      headers: {
          'Authorization': `Bearer ${token}` // Certifique-se de que o token está sendo enviado
      }
  });
  userData = await response.json();    
        console.log(userData.id)
        receiveHonors()
        receiveRatings()
        const userImage = await fetchUserImage(thisId);
        document.getElementById('profilePic').src = userImage;
})
async function receiveHonors(){
    const allHonorResponse = await fetch(`http://localhost:3000/honorInfo?id=${thisId}`, {
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
    document.getElementById("leadership").textContent = honorData.leadership_honors;
    document.getElementById("sociable").textContent = honorData.sociable_honors;
    document.getElementById("participative").textContent = honorData.participative_honors;
    
}
async function receiveRatings(){
    const ratingsResponse = await fetch(`http://localhost:3000/getRatings?userId=${thisId}`, {
        method: 'GET'
    });
    
    let ratingsResult = await ratingsResponse.json();
    document.getElementById('rating').textContent = parseFloat(ratingsResult.average_rating).toFixed(1);

    ratingsResult.ratings.forEach(rating => {
        if(rating.rating_user_id!=userData.id){
            addComment(rating);
            console.log(rating)
        }else{
            userComment(rating)
   
        }
    });
}
async function userComment(rating){
    const userImage = await fetchUserImage(userData.id);
    document.getElementById('yourRating').innerHTML = `
    <div id='topHalf' style="height: 5dvh;display:flex;justify-content: space-around">
        <div style="height: 5dvh;display:flex">
            <img style="height: 5dvh;border-radius: 50%" src="${userImage}" alt="Sua Foto">
            <h3>Você</h3>
        </div>
        <div style="height: 5dvh;display:flex">
            <img style="height: 5dvh" src="../src/yellowStar.png" alt="Estrela">
            <h3>${rating.rating_value}</h3>
        </div>
    </div>
    <div id='bottomHalf' style="height: 90%;display:flex; justify-content:center;align-items:center">
        <textarea readonly style="resize: none;height: 60%;width: 35dvw;display:flex" 
                  id="comment" name="description" required maxlength="500">${rating.comment}</textarea>
    </div>
    `;
    document.getElementById('yourRating').style.display = "block";
}
async function addComment(rating) {
    const raterInfo = await getUser(rating.rating_user_id); 
    const userImage = await fetchUserImage(rating.rating_user_id); 

    const div = document.createElement('div');
    div.classList.add('commentCard');

    div.innerHTML = `
        <div id='topHalf' style="height: 5dvh;display:flex;justify-content: space-around">
            <div style="height: 5dvh;display:flex">
                <img style="height: 5dvh; border-radius: 50%;" src="${userImage}" alt="${raterInfo.name}">
                <h3>${raterInfo.name}</h3> 
            </div>
            <div style="height: 5dvh;display:flex">
                <img style="height: 5dvh" src="../src/yellowStar.png" alt="Estrela">
                <h3>${rating.rating_value}</h3>
            </div>
        </div>
        <div id='bottomHalf' style="height: 90%;display:flex; justify-content:center;align-items:center">
            <textarea readonly style="resize: none;height: 60%;width: 35dvw;display:flex" 
                      id="comment" name="description" required maxlength="500">${rating.comment}</textarea>
        </div>
    `;

    document.getElementById('comments').appendChild(div); // Adiciona ao container de comentários
}

async function getUser(userId){
    const userIdResponse = await fetch(`http://localhost:3000/userId?id=${userId}`);
    if (!userIdResponse.ok) {
        throw new Error(`Erro ao buscar organizador: ${userIdResponse.statusText}`);
    }
    return await userIdResponse.json();
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