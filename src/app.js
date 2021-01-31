const Modal = {
  toggle() {
    const modalOverlay = document.querySelector('.modal-overlay');

    Form.clearFields();

    modalOverlay.classList.toggle('active');
  },
};

const Store = {
  get() {
    return JSON.parse(localStorage.getItem('transactions')) || [];
  },
  set(transactions) {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  },
};

const Transaction = {
  all: Store.get(),

  add(transaction) {
    this.all.push(transaction);

    App.reload();
  },

  remove(event, index) {
    const confirmation = confirm('Deseja mesmo deletar?');

    if (!confirmation) {
      event.preventDefault();
    } else {
      this.all.splice(index, 1);
      App.reload();
    }
  },

  incomes() {
    let incomes = 0;

    this.all.forEach(transaction => {
      if (transaction.amount >= 0) {
        incomes += transaction.amount;
      }
    });

    return incomes;
  },
  expenses() {
    let expenses = 0;

    this.all.forEach(transaction => {
      if (transaction.amount < 0) {
        expenses += transaction.amount;
      }
    });

    return expenses;
  },
  total() {
    return this.incomes() + this.expenses();
  },
};

const DOM = {
  updateBalance() {
    document.getElementById('income-display').innerHTML = Utils.formatCurrency(
      Transaction.incomes(),
    );
    document.getElementById('expense-display').innerHTML = Utils.formatCurrency(
      Transaction.expenses(),
    );

    document.getElementById('total-display').innerHTML = Utils.formatCurrency(
      Transaction.total(),
    );

    this.handleTotalClass();
  },

  handleTotalClass() {
    const totalContainer = document.getElementById('total-container');

    if (Transaction.total() < 0) {
      totalContainer.classList.add('negative');
    } else {
      totalContainer.classList.remove('negative');
    }
  },

  tbody: document.querySelector('#data-table tbody'),

  addTransaction(transaction, index) {
    const tr = document.createElement('tr');
    tr.innerHTML = this.innerHTMLTransaction(transaction, index);
    tr.dataset.index = index;
    this.tbody.appendChild(tr);
  },

  innerHTMLTransaction(transaction, index) {
    const amountClassCSS = transaction.amount >= 0 ? 'income' : 'expense';

    const amount = Utils.formatCurrency(transaction.amount);

    const node = `
      <td class="description">${transaction.description}</td>
      <td class="${amountClassCSS}">${amount}</td>
      <td class="date">${transaction.date}</td>
      <td>
        <img class="remove-transaction" onclick="Transaction.remove(event, ${index})" src="../assets/minus.svg" alt="Remover transação" />
      </td>
    `;

    return node;
  },

  clearOnReload() {
    this.tbody.innerHTML = '';
  },
};

const Utils = {
  formatCurrency(value) {
    const signal = Number(value) < 0 ? '-' : '';
    value = String(value).replace(/\D/g, '');
    value = Number(value) / 100;

    value = value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

    return signal + value;
  },

  formatAmount(value) {
    value = Math.round(Number(value) * 100);
    return value;
  },

  formatDate(date) {
    const splittedDate = date.split('-');
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
  },
};

const Form = {
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  getValues() {
    return {
      description: this.description.value,
      amount: this.amount.value,
      date: this.date.value,
    };
  },

  validateFields() {
    const { description, amount, date } = this.getValues();

    if (
      description.trim() === '' ||
      amount.trim() === '' ||
      date.trim() === ''
    ) {
      throw new Error('Preencha todos os campos!');
    }
  },

  formatData() {
    let { description, amount, date } = this.getValues();

    amount = Utils.formatAmount(amount);
    date = Utils.formatDate(date);

    return {
      description,
      amount,
      date,
    };
  },

  clearFields() {
    this.description.value = '';
    this.amount.value = '';
    this.date.value = '';
  },

  submit(event) {
    event.preventDefault();

    try {
      this.validateFields();
      const transaction = this.formatData();
      Transaction.add(transaction);
      Modal.toggle();
    } catch (err) {
      alert(err.message);
    }
  },
};

const App = {
  init() {
    Transaction.all.forEach((transaction, index) => {
      DOM.addTransaction(transaction, index);
    });

    DOM.updateBalance();

    Store.set(Transaction.all);
  },

  reload() {
    DOM.clearOnReload();

    this.init();
  },
};

App.init();
