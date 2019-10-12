var mainInfo = new Vue({
    el: "#mainInfo",
    data: {
        //Lista de Ingresos ordenados por fecha, tipo y hora
        inputs: [],
        //Lista de gastos ordenados por fecha y tipo
        expensesByDate: [],
        expenseTypes: [],
        expenseMode: 0,
        date: new Date(),
        //Los meses en javascript van de 0 a 11, y sin llenar con 0 los numeros de 1 cifra, 
        //por lo cual se necesita este array para ubicar y formatear bien cada mes. Uso -> months[date.getMonth()])
        months: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"],
        //Los dias en javascript no son rellenados con 0 cuando se trata de un numero de 1 cifra (Ej: "4" en lugar de "04")
        //por lo cual se necesita este array para ubicar y formatear bien cada dia. Uso -> days[date.getDate()])
        days: ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09",
            "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
            "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"],
        //DateTimePicker para busqueda DESDE
        searchFrom: "",

        //DateTimePicker para busqueda HASTA
        searchTo: "",

        //Objeto usado para los campos del formulario de gastos
        expense: { id: 0, amount: null, date: null, description: "", expenseType: 0 },
        //Objeto para los campos del formulario de ingresos extra
        extra: { id: 0, amount: null, date: null, description: "" },
        //Mensaje de error al guardar un nuevo gasto
        expenseFormFailMessage: "",
        //Mensaje de error al guardar un nuevo ingreso
        extraFormFailMessage: "",
        //Guarda la fecha del gasto clickeado, para saber qué detalles se visualizan
        expenseClicked: "",
        //Guarda la fecha del ingreso clickeado, para saber qué detalles se visualizan
        inputClicked: "",
        //Se ponen en true cuando se esta realizando la busqueda de gastos o ingresos, para que se vea el spinner girando
        loadingInputs: false,
        loadingExpenses: false
    },
    methods: {
        //Setea las fechas en un formato que entiende el dateTimePicker de la vista
        constructor() {
            this.searchFrom = this.date.getFullYear() + "-" + this.months[this.date.getMonth()] + "-" + this.days[this.date.getDate()];
            this.searchTo = this.searchFrom;
            this.getExpenseTypes();
        },
        getExpenseTypes() {
            genericListSearch("/api/info/getExpenseTypes",
                function (result) {
                    mainInfo.expenseTypes = result;
                },
                function () {

                }
            );
        },
        //Envia fecha desde y hasta en formato string. Devuelve la lista de ingresos entre esas fechas 
        getInputs() {
            mainInfo.loadingInputs = true;
            $.get({
                url: "api/info/getInputs",
                data: {
                    dateFrom: mainInfo.searchFrom, dateTo: mainInfo.searchTo + " 23:59:59"
                }
            }).done(function (result) {
                mainInfo.loadingInputs = false;
                mainInfo.inputs = result;
            }).fail(function () {
                bootbox.alert("Hubo un error al recuperar los ingresos. Por favor, intente nuevamente.");
            });
        },
        //Envia fecha desde y hasta en formato string. Devuelve la lista de gastos entre esas fechas
        getExpensesByDate() {
            mainInfo.loadingExpenses = true;
            $.get({
                url: "api/info/getExpensesByDate",
                data: {
                    dateFrom: mainInfo.searchFrom, dateTo: mainInfo.searchTo + " 23:59:59"
                }
            }).done(function (result) {
                mainInfo.loadingExpenses = false;
                mainInfo.expensesByDate = result;
            }).fail(function () {
                bootbox.alert("Hubo un error al recuperar los gastos. Por favor, intente nuevamente.");
            });
        },
        //Abre el modal de formulario de carga de gastos y setea los campos a los valores por defecto
        addExpense() {
            this.expenseFormFailMessage = "";
            var dateNow = this.date.getFullYear() + "-" + this.months[this.date.getMonth()] + "-" + this.days[this.date.getDate()];
            this.expense = {
                id: 0,
                amount: null,
                date: dateNow,
                expenseTypeId: 0,
                description: ""
            };
            $("#expenseFormModal").modal("show");
        },
        //Abre el modal de formulario de carga de ingresos extra y setea los campos a los valores por defecto
        addExtra() {
            this.extraFormFailMessage = "";
            var dateNow = this.date.getFullYear() + "-" + this.months[this.date.getMonth()] + "-" + this.days[this.date.getDate()];
            this.extra = {
                id: 0,
                amount: null,
                date: dateNow,
                description: ""
            };
            $("#extraFormModal").modal("show");
        },
        //Valida el formulario y guarda el gasto (ya sea nuevo o modificado, se usa siempre esta funcion)
        saveExpense(form) {
            $(form).validate();
            if (!$(form).valid()) return;
            this.expenseFormFailMessage = "";
            genericSaveItem("/api/Info/SaveExpense",
                JSON.stringify(mainInfo.expense),
                function () {
                    $("#expenseFormModal").modal("hide");  
                    mainInfo.getExpensesByDate();
                },
                function (result) {
                    mainInfo.expenseFormFailMessage = result.responseText;
                }
            );
        },
        //Valida el formulario y guarda el ingreso extra (ya sea nuevo o modificado, se usa siempre esta funcion)
        saveExtra(form) {
            $(form).validate();
            if (!$(form).valid()) return;
            this.extraFormFailMessage = "";
            genericSaveItem("/api/Info/SaveExtra",
                JSON.stringify(mainInfo.extra),
                function () {
                    $("#extraFormModal").modal("hide");
                    mainInfo.getInputs();
                },
                function (result) {
                    mainInfo.extraFormFailMessage = result.responseText;
                }
            );
        },
        //Llega como parámetro la fecha de gasto que se clickeó y setea expenseClicked para comenzar a (o dejar de) visualizar los detalles
        //de los gastos de esa fecha.
        clickExpense(exp) {
            if (this.expenseClicked === exp)
                this.expenseClicked = "";
            else
                this.expenseClicked = exp;
        },
        //Llega como parámetro la fecha de ingreso que se clickeó y setea expenseClicked para comenzar a (o dejar de) visualizar los detalles
        //de los ingresos de esa fecha.
        clickInput(date) {
            if (this.inputClicked === date)
                this.inputClicked = "";
            else
                this.inputClicked = date;
        },
        //Similar a addExpense solo que completa los campos con el gasto clickeado (que le llega como parametro)
        editExpense(expense) {
            this.expenseFormFailMessage = "";
            this.expense = {
                id: expense.id,
                amount: expense.amount,
                date: expense.dateForDTP,
                expenseTypeId: expense.expenseTypeId,
                description: expense.description
            };
            $("#expenseFormModal").modal("show");
        },
        //Similar a addExpense solo que completa los campos con el ingreso clickeado (que le llega como parametro)
        editExtra(extra) {
            this.extraFormFailMessage = "";
            this.extra = {
                id: extra.id,
                amount: extra.amount,
                date: extra.dateForDTP,
                description: extra.description
            };
            $("#extraFormModal").modal("show");
        },
        //Llega el id del gasto y el indice como parámetro. El id es para eliminarlo de la base de datos 
        //y el indice es para eliminarlo del frontEnd.
        deleteExpense(id, iDet) {
            genericBootboxConfirm("¿Seguro desea eliminar?", 
                "Eliminar", "btn btn-sm btn-danger",
                "Cancelar", "btn btn-sm btn-link",
                function () {
                    mainInfo.$delete(mainInfo.expensesByDate, iDet);
                    $.ajax({
                        url: "/api/info/deleteExpense/" + id,
                        method: "DELETE"
                    }).fail(function (result) {
                        bootbox.alert(result.responseText);
                        mainInfo.getExpensesByDate();
                    });
                }
            );
        },
        //Llega el ingreso entero como parámetro. Se envía el id para eliminarlo de la base de datos 
        //y se obtiene el indice es para eliminarlo del frontEnd.
        deleteExtra(extra) {
            genericBootboxConfirm("¿Seguro desea eliminar?",
                "Eliminar", "btn btn-sm btn-danger",
                "Cancelar", "btn btn-sm btn-link",
                function () {
                    mainInfo.$delete(mainInfo.inputs, mainInfo.inputs.indexOf(extra));
                    $.ajax({
                        url: "/api/info/deleteExtra/" + extra.id,
                        method: "DELETE"
                    }).fail(function (result) {
                        bootbox.alert(result.responseText);
                        mainInfo.getInputs();
                    });
                }
            );
        },
        rollbackOrder(order) {
            genericBootboxConfirm("¿Seguro desea deshacer este cobro y volver a abrir la mesa?",
                "Confirmar", "btn btn-sm btn-info",
                "Cancelar", "btn btn-sm btn-link",
                function () {
                    mainInfo.$delete(mainInfo.inputs, mainInfo.inputs.indexOf(order));
                    $.ajax({
                        url: "/api/info/rollback/" + order.id,
                        method: "DELETE"
                    }).fail(function (result) {
                        bootbox.alert(result.responseText);
                        mainInfo.getInputs();
                    });
                }
            );
        },
        changeExpenseMode(newMode) {
            this.expenseMode = newMode;
        }
    },
    computed: {
        //Agrupa los ingresos (ordenes y extras) por fecha. 
        //Dentro de cada agrupacion quedan ordenados por tipo (orden o extra) y luego por hora
        inputsGrouped() {
            var inputsGrouped = [];
            var lastDate = null;
            this.inputs.forEach(function (input) {
                if (lastDate === input.date) {
                    inputsGrouped[inputsGrouped.length - 1].amount += input.amount;
                }
                else {
                    inputsGrouped.push({ date: input.date, amount: input.amount, orders: 0, extras: 0 });
                    lastDate = input.date;
                }
                if (input.type === 'o')
                    inputsGrouped[inputsGrouped.length - 1].orders += 1;
                else
                    inputsGrouped[inputsGrouped.length - 1].extras += 1;
            });
            return inputsGrouped;
        },
        //Agrupa los gastos por fecha. 
        //Dentro de cada agrupacion quedan ordenados por tipo (Empleado, proveedor y demas).
        expensesGrouped() {
            var expensesGrouped = [];
            var lastDate = null;
            this.expensesByDate.forEach(function (e) {
                if (lastDate === e.date) {
                    expensesGrouped[expensesGrouped.length - 1].amount += e.amount;
                }
                else {
                    expensesGrouped.push({ date: e.date, amount: e.amount });
                    lastDate = e.date;
                }
            });
            return expensesGrouped;
        },
        //Devuelve el monto total de ingresos de ordenes de las mesas
        totalOrders() {
            var sum = 0;
            this.inputs.forEach(function (input) {
                if (input.type === 'o')
                    sum += input.amount;
            });
            return sum;
        },
        //Devuelve el monto total de ingresos extra
        totalExtras() {
            var sum = 0;
            this.inputs.forEach(function (input) {
                if (input.type === 'e')
                    sum += input.amount;
            });
            return sum;
        },
        //Devuelve el monto total de ingresos (ordenes + extra)
        totalInputs() {
            return this.totalExtras + this.totalOrders;
        },

        //Devuelve el monto total de gastos
        totalExpended() {
            var sum = 0;
            this.expensesByDate.forEach(function (e) {
                sum += e.amount;
            });
            return sum;
        },

        totalsByExpenseType() {
            var types = [];
            this.expensesByDate.forEach(function (e) {
                var exist = false;
                types.forEach(function (type) {
                    if (type.id === e.expenseTypeId) {
                        type.amount += e.amount;
                        exist = true;
                    }
                });
                if (!exist) {
                    types.push({
                        id: e.expenseTypeId,
                        description: e.expenseTypeDescription,
                        amount: e.amount
                    });
                }
            });
            return types;
        },

        //Balance de ingresos - gastos
        totalIn() {
            return this.totalInputs - this.totalExpended;
        }
    }
});
mainInfo.constructor();
mainInfo.getInputs();
mainInfo.getExpensesByDate();

//Cuando se abre el modal hace foco en el primer input
$("#expenseFormModal").on("shown.bs.modal", function () { $("#expenseAmountInput").focus(); });
$("#extraFormModal").on("shown.bs.modal", function () { $("#extraAmountInput").focus(); });


