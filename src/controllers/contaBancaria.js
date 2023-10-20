//desestruturacao do banco de dados, retirando o  array de objeto contas e o idUnico
let { contas, idUnico, saques, depositos, transferencias } = require('../bancodedados')

// Functions para facilitar a leitura do codigo e para não repetir o mesmo codigo varias vezes.
const { encontrarContaBancaria, verificDeDuplicidadeContaBancaria, verificExistenciaContaBancaria } = require('../functions/funcoes')

// controlador para listagem das contas bancarias
function listagemContasBancarias(req, res) {
    const { senha_banco } = req.query;
    const senhaAcessoBanco = 'Cubos123Bank'

    try {
        // verificacao; se a senha do banco existe
        if (senha_banco) {
            //verificao; se a senha passada na requisicao pelo query é a mesma que a senha correta 
            if (senha_banco === senhaAcessoBanco) {
                res.json(contas)
            } else {
                return res.status(401).json({ message: 'Senha incorreta, acesso negado!' })
            }
        } else {
            return res.status(403).json({ message: ' Por favor coloque a senha para ter acesso as contas bancarias' })
        }
    } catch (erro) {
        return res.status(400).json({ message: `Ocorreu um erro inesperado ->  ${erro.message}.` })
    }
}

// controlador para cadastrar uma nova conta bancaria
function cadastrarNovaConta(req, res) {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

    try {
        // verificacao; se na requisicao foi colocado todos os dados no body
        if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
            return res.status(400).json([{ message: `Informe todos os campos corretamente` }])
        }

        //verificação; se alguma conta bancaria já possui usuario com o cpf||email informado no body
        if (verificDeDuplicidadeContaBancaria(cpf, email, res)) {
            return res.status(400).json({ message: 'os Dados informados já foram usados em algumm cadastro!' })
        }

        // se todas as verificacoes estiverem ok, prosseguir para o cadastro da nova conta.
        const conta = {
            numero: idUnico++,
            saldo: 0,
            usuario: {
                nome,
                cpf,
                data_nascimento,
                telefone,
                email,
                senha
            }
        }
        contas.push(conta)

        return res.status(201).json({ message: `${nome}, Sua conta foi criada com sucesso!` })
    } catch (erro) {
        return res.status(400).json({ message: `Ocorreu um erro inesperado ->  ${erro.message}.` })
    }
}

// controlador para atualizar os dados do usuario na sua conta bancaria
function atualizarContaBancafia(req, res) {
    const { numeroConta } = req.params;
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

    try {
        // verificacao; se na requisicao foi colocado todos os dados necessarios no body
        if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
            return res.status(400).json([{ message: `Informe todos os campos corretamente` }])
        }

        //selecionando a conta bancaria de acordo com o parametro numeroConta informado na requisição
        const contaBancaria = encontrarContaBancaria(numeroConta)

        // verificao; se a conta bancaria foi encontrada ou se não existe.
        verificExistenciaContaBancaria(contaBancaria, res)

        // desestruturacao do objeto usuario para acessar seus dados de uma forma mais simples.
        const { usuario } = contaBancaria

        //verificacao; se alguma conta bancaria já possui usuario com o cpf||email informado no body
        if (verificDeDuplicidadeContaBancaria(cpf, email, res)) {
            return res.status(400).json({ message: 'os Dados informados já foram usados em algumm cadastro!' })
        }

        // se as verificacoes estiverem ok, atualizar/alterar as informações do usuario na sua conta bancaria 
        usuario.nome = nome
        usuario.cpf = cpf
        usuario.data_nascimento = data_nascimento
        usuario.telefone = telefone
        usuario.email = email
        usuario.senha = senha

        return res.status(203).json({ message: 'As informações do usuario foram atualizadas!' })

    } catch (erro) {
        return res.status(400).json({ message: `Ocorreu um erro inesperado ->  ${erro.message}.` })
    }
}

// controlador para deletrar uma conta bancaria 
function deletarContaBancaria(req, res) {
    const { numeroConta } = req.params;

    try {
        //selecionando a conta bancaria de acordo com o parametro numeroConta informado na requisição
        const contaBancaria = encontrarContaBancaria(numeroConta)

        // verificao; se a conta bancaria foi encontrada ou se não existe.
        verificExistenciaContaBancaria(contaBancaria, res)

        //verificacao; se o saldo da conta é diferente de zero.
        if (contaBancaria.saldo !== 0) {
            return res.status(400).json([{ message: `A conta só pode ser removida se o saldo for zero!` }])
        }

        // se as verificações estiverem ok, continuar para o processo de deletar a Conta desejada.
        contas = contas.filter((elementoAtual) => {
            return elementoAtual !== contaBancaria
        })

        return res.status(203).json({ message: ' usuario removido com sucesso!' })

    } catch (erro) {
        return res.status(400).json({ message: `Ocorreu um erro inesperado ->  ${erro.message}.` })
    }
}

// controlador para fazer o deposito na conta bancaria
function depositarContaBancaria(req, res) {
    const { numero_conta, valor } = req.body;

    try {
        // verificação da existencia na requisição, das informações numero da conta e valor, no body
        if (!numero_conta || !valor) {
            return res.status(404).json({ message: 'Informe todos os campos corretamente!' })
        }

        //selecionando a conta bancaria de acordo com o parametro numeroConta informado na requisição
        const contaBancaria = encontrarContaBancaria(numero_conta)

        // verificao; se a conta bancaria foi encontrada ou se não existe.
        verificExistenciaContaBancaria(contaBancaria, res)

        // verificacao; se o valor do deposito é um numero natural.
        if (valor < 1) {
            return res.status(400).json({ message: 'Não é possivel depositar valores negativos ou zerados.' })
        }

        // se as verificacoes estiverem ok, fazer a alteracao no saldo e fazer o registro do deposito
        contaBancaria.saldo += valor
        const registroDeposito = {
            data: new Date(),
            numero_conta,
            valor
        }

        depositos.push(registroDeposito)

        return res.json(registroDeposito)
    } catch (erro) {
        return res.status(400).json({ message: `Ocorreu um erro inesperado ->  ${erro.message}.` })
    }
}

// controlador para fazer o saca da conta bancaria
function sacarContaBancaria(req, res) {
    const { numero_conta, valor, senha } = req.body;

    try {
        // verificacao; se na requisicao foi colocado todos os dados necessarios no body
        if (!numero_conta || !valor || !senha) {
            return res.status(404).json({ message: 'Informe todos os campos corretamente!' })
        }

        //selecionando a conta bancaria de acordo com o parametro numeroConta informado na requisição
        const contaBancaria = encontrarContaBancaria(numero_conta)

        // verificao; se a conta bancaria foi encontrada ou se não existe.
        verificExistenciaContaBancaria(contaBancaria, res)

        // desestruturacao do objeto usuario para acessar seus dados de uma forma mais simples.
        const { usuario } = contaBancaria

        // operador ternario para facilitar a leitura do codigo;
        const verificSenha = senha === usuario.senha ? true : false

        //verificacao: se a senha digitada no body é a senha correta da conta bancaria
        if (!verificSenha) {
            return res.status(400).json({ message: 'Senha INVALIDA, digite a senha correta e tente novamente!' })
        }

        // operador ternario para facilitar a leitura do codigo
        const verificExistenciaDeSaldoParaSaque = valor <= contaBancaria.saldo ? true : false

        if (!verificExistenciaDeSaldoParaSaque) {
            return res.status(400).json({ message: 'Saldo insuficiente!' })
        }

        // se as verificacoes estiverem ok, fazer a alteracao no saldo e fazer o registro do saque
        contaBancaria.saldo -= valor
        const registroSaque = {
            numero_conta,
            valor,
            senha
        }

        saques.push(registroSaque)

        return res.json(registroSaque)
    } catch (erro) {
        return res.status(400).json({ message: `Ocorreu um erro inesperado ->  ${erro.message}.` })
    }
}

function transferirContaBancarias(req, res) {
    const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body;

    try {
        // verificacao; se na requisicao foi colocado todos os dados necessarios no body
        if (!numero_conta_origem || !numero_conta_destino || !valor || !senha) {
            return res.status(404).json({ message: 'Informe todos os campos corretamente!' })
        }

        //selecionando as contas bancarias de acordo com os parametros informado na requisição
        const contaBancariaOrigem = encontrarContaBancaria(numero_conta_origem)
        const contaBancariaDestino = encontrarContaBancaria(numero_conta_destino)

        // verificacao; se as contas bancarias foram encontrada ou se não existem.
        if (!contaBancariaOrigem) {
            return res.status(400).json([{ message: ` Esse Usuario não existe!` }])
        }
        if (!contaBancariaDestino) {
            return res.status(400).json([{ message: ` Esse Usuario não existe!` }])
        }

        // desestruturacao do usuario para facilitar a leitura do codigo
        const { usuario } = contaBancariaOrigem

        // operador ternario para facilitar a leitura do codigo;
        const verificSenha = senha === usuario.senha ? true : false

        //verificacao: se a senha digitada no body é a senha correta da conta bancaria de origem
        if (!verificSenha) {
            return res.status(400).json({ message: 'Senha INVALIDA, digite a senha correta e tente novamente!' })
        }

        //verificacao; se o saldo é suficiente para transferir o valor informado no body
        if (valor > contaBancariaOrigem.saldo) {
            return res.status(400).json({ message: 'Saldo insuficiente!' })
        }

        // se as verificacoes estiverem ok, fazer a alteracao nos saldos e fazer o registro da transferencia
        contaBancariaOrigem.saldo -= valor
        contaBancariaDestino.saldo += valor

        const registroTransferencia = {
            numero_conta_origem,
            numero_conta_destino,
            valor,
            senha
        }

        transferencias.push(registroTransferencia)

        return res.json(registroTransferencia)
    } catch (erro) {
        return res.status(400).json({ message: `Ocorreu um erro inesperado ->  ${erro.message}.` })
    }
}

function listarSaldoContaBancaria(req, res) {
    const { numero_conta, senha } = req.query;

    try {
        // verificacao; se na requisicao foi colocado todos os dados necessarios no body
        if (!numero_conta || !senha) {
            return res.status(404).json({ message: 'Informe todos os campos corretamente!' })
        }

        //selecionando a conta bancaria de acordo com o parametro numeroConta informado na requisição
        const contaBancaria = encontrarContaBancaria(numero_conta)

        // verificao; se a conta bancaria foi encontrada ou se não existe.
        verificExistenciaContaBancaria(contaBancaria, res)

        // desestruturacao do objeto usuario para acessar seus dados de uma forma mais simples.
        const { usuario, saldo } = contaBancaria


        // operador ternario para facilitar a leitura do codigo;
        const verificSenha = senha === usuario.senha ? true : false

        //verificacao: se a senha digitada no body é a senha correta da conta bancaria
        if (!verificSenha) {
            return res.status(400).json({ message: 'Senha INVALIDA, digite a senha correta e tente novamente!' })
        }

        // se as verificacoes estiverem ok, listar o saldo da conta desejada
        return res.json(saldo)
    } catch (erro) {
        return res.status(400).json({ message: `Ocorreu um erro inesperado ->  ${erro.message}.` })
    }
}

function listarExtratoContaBancaria(req, res) {
    const { numero_conta, senha } = req.query;

    try {
        // verificacao; se na requisicao foi colocado todos os dados necessarios no body
        if (!numero_conta || !senha) {
            return res.status(404).json({ message: 'Informe todos os campos corretamente!' })
        }

        //selecionando a conta bancaria de acordo com o parametro numeroConta informado na requisição
        const contaBancaria = encontrarContaBancaria(numero_conta)

        // verificao; se a conta bancaria foi encontrada ou se não existe.
        verificExistenciaContaBancaria(contaBancaria, res)

        // desestruturacao do usuario para facilitar a leitura do codigo
        const { usuario } = contaBancaria

        // operador ternario para facilitar a leitura do codigo;
        const verificSenha = senha === usuario.senha ? true : false

        //verificacao: se a senha digitada no body é a senha correta da conta bancaria
        if (!verificSenha) {
            return res.status(400).json({ message: 'Senha INVALIDA, digite a senha correta e tente novamente!' })
        }

        // Filtrando apenas os depositos da conta bancaria desejada
        const depositosContaBancaria = depositos.filter((elementoAtual) => {
            return elementoAtual.numero_conta === numero_conta
        })

        // Filtrando apenas os saques da conta bancaria desejada
        const saquesContaBancaria = saques.filter((elementoAtual) => {
            return elementoAtual.numero_conta === numero_conta
        })

        // Filtrando apenas as transferencias da conta bancaria desejada
        const transferenciasContaBancaria = transferencias.filter((elementoAtual) => {
            return elementoAtual.numero_conta_origem === Number(numero_conta)
        })

        // criando uma variavel extrato da conta bancaria desejada, com os depositos, saques e transferencias dessa conta especifica
        const extratoContaBancaria = {
            depositos: depositosContaBancaria,
            saques: saquesContaBancaria,
            transferencias: transferenciasContaBancaria
        }

        return res.json(extratoContaBancaria)
    } catch (erro) {
        return res.status(400).json({ message: `Ocorreu um erro inesperado ->  ${erro.message}.` })
    }
}


module.exports = {
    listagemContasBancarias,
    cadastrarNovaConta,
    atualizarContaBancafia,
    deletarContaBancaria,
    depositarContaBancaria,
    sacarContaBancaria,
    transferirContaBancarias,
    listarSaldoContaBancaria,
    listarExtratoContaBancaria
}