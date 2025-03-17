const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');
const path = require('path');

// Função auxiliar para gerar nome de usuário aleatório
function generateRandomUsername() {
    const prefix = 'user';
    const randomNum = Math.floor(Math.random() * 100000);
    return `${prefix}${randomNum}`;
}

// Rota para exibir o formulário de criação de conta
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/google-account.html'));
});

// Rota para criar a conta Google
router.post('/create', async (req, res) => {
    const { firstName, lastName, phoneNumber } = req.body;
    const username = generateRandomUsername();
    const password = `${username}Pass123!`; // Senha segura baseada no username

    try {
        const browser = await puppeteer.launch({
            headless: 'new',  // Use o novo modo headless
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--single-process',
                '--no-zygote'
            ],
            executablePath: process.env.NODE_ENV === 'production' 
                ? process.env.PUPPETEER_EXECUTABLE_PATH 
                : puppeteer.executablePath()
        });

        const page = await browser.newPage();
        
        // Configurar timeout maior para operações de navegação
        page.setDefaultNavigationTimeout(120000); // Aumentado para 2 minutos
        
        console.log('Iniciando criação de conta...');
        
        // Acessar página de criação de conta do Google
        await page.goto('https://accounts.google.com/signup', {
            waitUntil: 'networkidle0'
        });
        
        console.log('Página carregada, preenchendo formulário...');
        
        // Preencher formulário
        await page.waitForSelector('input[name="firstName"]', { timeout: 60000 });
        await page.type('input[name="firstName"]', firstName);
        await page.type('input[name="lastName"]', lastName);
        await page.type('input[name="Username"]', username);
        await page.type('input[name="Passwd"]', password);
        await page.type('input[name="ConfirmPasswd"]', password);
        
        console.log('Formulário preenchido, avançando...');
        
        // Clicar no botão próximo
        await page.click('#accountDetailsNext');
        
        // Aguardar e preencher número de telefone
        await page.waitForSelector('input[type="tel"]', { timeout: 60000 });
        await page.type('input[type="tel"]', phoneNumber);
        
        console.log('Número de telefone preenchido, finalizando...');
        
        // Clicar em próximo após telefone
        await page.click('button[type="submit"]');
        
        // Aguardar um tempo para processamento
        await page.waitForTimeout(5000);
        
        await browser.close();
        
        console.log('Conta criada com sucesso!');
        
        // Retornar credenciais criadas
        res.json({
            success: true,
            credentials: {
                email: `${username}@gmail.com`,
                password: password
            }
        });
        
    } catch (error) {
        console.error('Erro ao criar conta:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router; 