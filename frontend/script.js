document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('uploadForm');
    const fileInput = document.getElementById('fileInput');
    const alertContainer = document.getElementById('alertContainer');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const files = fileInput.files;
        if (!files.length) {
            showAlert('Nenhum arquivo foi selecionado!', 'danger');
            return;
        }

        const formData = new FormData();
        for (const file of files) {
            formData.append('files', file);
        }

        try {
            const response = await fetch('http://localhost:3001/upload-multiple', {
                method: 'POST',
                body: formData,
            });
           
            if (response.ok) {
                const result = await response.json();
                const downloadLink = `http://localhost:3001${result.url}`;
                const linkElement = document.createElement('a');
                linkElement.href = downloadLink;
                linkElement.innerText = 'Clique aqui para baixar o PDF gerado';
                linkElement.download = 'output.pdf';
                document.body.appendChild(linkElement);
                showAlert('PDF gerado com sucesso!', 'success');
            } else {
                const errorMessage = await response.text();
                showAlert(errorMessage, 'danger');
            }
        } catch (error) {
            console.error('Erro:', error);
            showAlert('Ocorreu um erro ao enviar os arquivos. Tente novamente.', 'danger');
        }
    });

    function showAlert(message, type) {
        alertContainer.innerHTML = `
            <div class="alert alert-${type}" role="alert">
                ${message}
            </div>
        `;
        setTimeout(() => alertContainer.innerHTML = '', 5000);
    }
});


