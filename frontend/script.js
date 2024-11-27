document.getElementById('uploadForm').addEventListener('submit', function(e) {
    e.preventDefault();  // Impede o comportamento padrão do formulário

    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];  // Pega o primeiro arquivo selecionado

    if (!file) {
        alert('Por favor, selecione um arquivo.');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    // Envia o arquivo usando a API fetch
    fetch('http://localhost:3000/upload', {  // Alterado para a URL completa
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

