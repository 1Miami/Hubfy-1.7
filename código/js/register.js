document.getElementById('profilePhoto').addEventListener('change', function () {
    const file = this.files[0];

    if (file) {
        // Exibe a imagem de pré-visualização
        const reader = new FileReader();
        reader.onloadend = function () {
            document.getElementById('previewImage').src = reader.result;
            document.getElementById('previewImage').style.display = 'block';
            document.getElementById('defaultIcon').style.display = 'none'; // Esconde o ícone de "+" após a imagem ser selecionada
        };
        reader.readAsDataURL(file);
    }
});

// Adiciona evento de clique ao ícone "+" para abrir o seletor de arquivos
document.getElementById('defaultIcon').addEventListener('click', function () {
    document.getElementById('profilePhoto').click();
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', document.getElementById('name').value);
    formData.append('contact_info', document.getElementById('contact').value);
    formData.append('age', document.getElementById('age').value);
    formData.append('password', document.getElementById('password').value);
    formData.append('profilePhoto', document.getElementById('profilePhoto').files[0]);

    const response = await fetch('http://localhost:3000/register', {
        method: 'POST',
        body: formData,
    });

    const messageElement = document.getElementById('message'); // Define messageElement

    if (response.ok) {
        messageElement.textContent = 'Usuário registrado com sucesso!';
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    } else {
        const errorMessage = await response.text();
        messageElement.textContent = errorMessage;
    }
});