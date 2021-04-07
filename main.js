//abre e fecha o modal
const Modal = {
    open() {
        // Abrir modal
        // Adicionar a class active ao modal
        document
            .querySelector('.modal-overlay')
            .classList
            .add('active')

    },
    close() {
        // fechar o modal
        // remover a class active do modal
        document
            .querySelector('.modal-overlay')
            .classList
            .remove('active')
    }
}

//salvando as minhas transações no localStorage do navegador
const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

//responsável por add, remover, e calcular as receitas
const Transaction = {
    all: Storage.get(),

    //add uma nova transação para o meu localStorage
    add(transaction) {
        Transaction.all.push(transaction)

        App.reload()
    },

    //remove um item da minha tabela de dados
    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },
    //a lógica de calcular todas as entradas, saidas e o total
    incomes() {
        let income = 0;
        Transaction.all.forEach(transaction => {
            if (transaction.amount > 0) {
                income += transaction.amount;
            }
        })
        return income;
    },

    expenses() {
        let expense = 0;
        Transaction.all.forEach(transaction => {
            if (transaction.amount < 0) {
                expense += transaction.amount;
            }
        })
        return expense;
    },
    total() {
        return Transaction.incomes() + Transaction.expenses();
    }
}

//renderiza todo o meu html, com os dados formatados
const DOM = {
    //tbody da minha tabela
    transactionsContainer: document.querySelector('#data-table tbody'),

    //
    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },
    //envia a estrutura html para a minha nova transação
    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
        </td>
        `

        return html
    },
    //atualiza a minha receita: total, entradas, saidas
    updateBalance() {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },
    //limpa o tbody do meu html
    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

//responsávle por toda a formatação dos meus dados (data, valor) => date, amount
const Utils = {
    //retira os pontos e virgulas do meu amount (./,)
    formatAmount(value) {
        value = Number(value.replace(/\,\./g, "")) * 100

        return Math.floor(value);
    },

    //retorna a minha data formatada, separada por (-)
    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },
    //recebe a minha conta final da funcão (total)
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value;
    }
}

//validação geral
const Form = {
    //pego os elementos html
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    //pega os dados dos inputs
    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    //observa se os dados estão vazios
    validateFields() {
        //desestruturação
        const { description, amount, date } = Form.getValues()

        //O método trim() remove os espaços em branco
        if (description.trim() === "" ||
            amount.trim() === "" ||
            date.trim() === "") {
            //obejeto Erro, posso declara-lo e depois
            //capturar o erro atráves da funcão try...catch 
            throw new Error("Por favor, preencha todos os campos")
        }
    },

    //recebe os valores e executa a função que está dentro do Obj.Utils
    //chamada formatdate e formatAmount
    formatValues() {
        let { description, amount, date } = Form.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    //quando o formulário é enviado ele limpa os campos
    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },
    //cerebro do meu objeto, pois executa todas as funções necessarias
    submit(event) {
        event.preventDefault();


        try {
            Form.validateFields()
            const transaction = Form.formatValues()
            Transaction.add(transaction)
            Form.clearFields()
            Modal.close()
        } catch (error) {
            alert(error.message)
        }
    }
}

const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction)

        DOM.updateBalance()

        Storage.set(Transaction.all)
    },
    reload() {
        DOM.clearTransactions()
        App.init()
    },
}

App.init()