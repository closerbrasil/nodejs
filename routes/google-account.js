const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');

// Função auxiliar para gerar nome de usuário aleatório
function generateRandomUsername() {
    const prefix = 'user';
    const randomNum = Math.floor(Math.random() * 100000);
    return `${prefix}${randomNum}`;
}

// Rota para exibir o formulário de criação de conta
router.get('/', (req, res) => {
    res.sendFile('google-account.html', { root: './views' });
});

// Rota para criar a conta Google
router.post('/create', async (req, res) => {
    const { firstName, lastName, phoneNumber } = req.body;
    const username = generateRandomUsername();
    const password = `${username}Pass123!`; // Senha segura baseada no username

    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();
        
        // Configurar timeout maior para operações de navegação
        page.setDefaultNavigationTimeout(60000);
        
        // Acessar página de criação de conta do Google
        await page.goto('https://accounts.google.com/signup');
        
        // Preencher formulário
        await page.waitForSelector('input[name="firstName"]');
        await page.type('input[name="firstName"]', firstName);
        await page.type('input[name="lastName"]', lastName);
        await page.type('input[name="Username"]', username);
        await page.type('input[name="Passwd"]', password);
        await page.type('input[name="ConfirmPasswd"]', password);
        
        // Clicar no botão próximo
        await page.click('#accountDetailsNext');
        
        // Aguardar e preencher número de telefone
        await page.waitForSelector('input[type="tel"]');
        await page.type('input[type="tel"]', phoneNumber);
        
        // Clicar em próximo após telefone
        await page.click('button[type="submit"]');
        
        // Aguardar um tempo para processamento
        await page.waitForTimeout(5000);
        
        await browser.close();
        
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