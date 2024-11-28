document.getElementById('uploadForm').addEventListener('submit', function(e) {
    e.preventDefault();  

    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];  

    if (!file) {
        alert('Por favor, selecione um arquivo.');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    fetch('http://localhost:3000/upload', {  
        method: 'POST',
        body: formData
        
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => { 
                throw new Error(text);  // Captura o erro e exibe a mensagem
            });
        }
        return response.text();  // Retorna a resposta do servidor
    })
    .then(data => {
        alert(data);  // Exibe a resposta do servidor
    })
    .catch(error => {
        console.error('Erro de rede ou servidor:', error);  // Exibe o erro no console para depuração
        alert('Erro: ' + error.message);  // Exibe um alerta com a mensagem de erro
    });
});

