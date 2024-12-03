document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('uploadForm');
    const fileInput = document.getElementById('fileInput');
    const alertContainer = document.getElementById('alertContainer');

    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Impede o envio padrão do formulário

        const file = fileInput.files[0];
        if (!file) {
            showAlert('Nenhum arquivo foi selecionado!', 'danger');
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            showAlert('Tipo de arquivo inválido! Apenas JPEG e PNG são permitidos.', 'danger');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:3000/uploads', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const successMessage = await response.text();
                showAlert(successMessage, 'success');
            } else {
                const errorMessage = await response.text();
                showAlert(errorMessage, 'danger');
            }
        } catch (error) {
            console.error('Erro:', error);
            showAlert('Ocorreu um erro ao enviar o arquivo. Tente novamente.', 'danger');
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