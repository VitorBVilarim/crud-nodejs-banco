const express = require('express')
const rotas = express()

const controllersContaBancaria = require('../controllers/contabancaria')

rotas.get('/contas', controllersContaBancaria.listagemContasBancarias)
rotas.post('/contas', controllersContaBancaria.cadastrarNovaConta)
rotas.put('/contas/:numeroConta/usuario', controllersContaBancaria.atualizarContaBancafia)
rotas.delete('/contas/:numeroConta', controllersContaBancaria.deletarContaBancaria)
rotas.post('/transacoes/depositar', controllersContaBancaria.depositarContaBancaria)
rotas.post('/transacoes/sacar', controllersContaBancaria.sacarContaBancaria)
rotas.post('/transacoes/transferir', controllersContaBancaria.transferirContaBancarias)
rotas.get('/contas/saldo', controllersContaBancaria.listarSaldoContaBancaria)
rotas.get('/contas/extrato', controllersContaBancaria.listarExtratoContaBancaria)

module.exports = rotas