
let { contas } = require('../bancodedados')

// Function para encontrar a conta desejada
function encontrarContaBancaria(numeroConta) {
    const contaBancaria = contas.find((elementoAtual) => {
        return elementoAtual.numero === Number(numeroConta)
    })

    return contaBancaria
}

// Function para verificar se existe a conta bancaria informada.
function verificExistenciaContaBancaria(contaBancaria, res) {
    if (!contaBancaria) {
        return res.status(400).json([{ message: ` Esse Usuario não existe!` }])
    }
}
//function para verificar a duplicidade do CPF
function verificDeDuplicidadeContaBancaria(cpf, email) {
    const verificacaoDeDuplicidadeCpf = contas.find((elementoAtual) => {
        return elementoAtual.usuario.cpf === cpf
    })

    const verificDeDuplicidadeEmail = contas.find((elementoAtual) => {
        return elementoAtual.usuario.email === email
    })

    if (verificacaoDeDuplicidadeCpf) {
        return true
    } else if (verificDeDuplicidadeEmail) {
        return true
    }
}
//  Fim das Functions usadas nos controladores.

module.exports = {
    encontrarContaBancaria,
    verificExistenciaContaBancaria,
    verificDeDuplicidadeContaBancaria,
}