
var mainBoard = new Vue({
    el: "#mainBoard",
    data: {
        formBoard: {
            id: 0, identification: "", top: 1, left: 1, state: 1
        },
        formOrder: {
            id: 0, name: ""
        },
        orderProducts: [],
        colors: [],
        boards: [],
        //food: [],
        //boardsReverse se usa para moverse hacia atras cuando apretas shitfTab :(
        //boardsReverse: [],
        movingBoards: false,
        boardSelected: null,
        productSelected: null,
        editingUnit: null,
        transferingOrder: false,
        placeImage: "",
        productFilter: "",
        boardFormFailMessage: "",
        orderNameFormFailMessage: "",
        orderDiscountFormFailMessage: ""
    },
    methods: {
        //#region Select
        clickBoard(event, index) {
            if (this.movingBoards) {
                if (!$(event.target).hasClass("active")) {
                    $(event.target).addClass("active");
                }
                else {
                    mainBoard.boards[index].top = 100 * $(event.target).position().top / $(event.target).parent(".outdoorIndoor").height();
                    mainBoard.boards[index].left = 100 * $(event.target).position().left / $(event.target).parent(".outdoorIndoor").width();
                    $(event.target).removeClass('active');
                }
            } else {
                if (this.boards[index].state !== 0) {
                    mainBoard.showOrder(index);
                }
            }
        },
        createBoard() {
            if (!this.movingBoards && !$("#boardFormModal").hasClass("show") && !$("#orderFormModal").hasClass("show")) {
                this.editingUnit = null;
                this.formBoard = {
                    id: 0, identification: "", top: 1, left: 1, state: 1
                };
                $("#boardFormModal").modal("show");
                $("#boardFormModalLabel").html("Nueva Mesa");
            }
        },
        editBoard() {
            if (this.boardSelected !== null && !this.movingBoards && !$("#boardFormModal").hasClass("show") && !$("#orderFormModal").hasClass("show")) {
                this.editingUnit = null;
                this.formBoard = Object.assign({}, this.boardSelected);
                $("#boardFormModal").modal("show");
                $("#boardFormModalLabel").html("Editar Mesa " + this.boardSelected.identification);
            }
        },
        showOrder(index) {
            if (this.boardSelected !== null) {
                if (this.boardSelected.id === this.boards[index].id) {
                    return;
                }
            }
            this.editingUnit = null;
            this.boardSelected = this.boards[index];
        },

        selectProduct(productId, event) {
            if (this.productSelected === null || this.productSelected !== productId) {
                $("TR.cursorPointer").removeClass("productFocused");
                $(event.target).closest("TR").addClass("productFocused");
                this.productSelected = productId;
                setTimeout(function () { $('.productFocused').children("TD").children("input").get(0).focus(); }, 1);
            }
        },
        setNullUnits() {
            this.orderProducts.forEach(function (type) {
                type.products.forEach(function (product) {
                    product.units = null;
                });
            });
        },
        setEditUnit(op, event) {
            if (this.editingUnit === null || this.editingUnit.id !== op.id) {
                this.editingUnit = Object.assign({}, op);
                setTimeout(function () { $(event.target).children("input").focus(); $(event.target).children("input").select(); }, 1);
            }
        },
        rightClickBoard(event, index) {
            event.preventDefault();
            if (!this.movingBoards) {
                this.movingBoards = true;
            }
            this.toggleHidding(index);
        },
        toggleHidding(index) {
            var state = this.boards[index].state;
            if (state === 1) {
                this.boards[index].state = 3;
            } else if (state === 3) {
                this.boards[index].state = 1;
            }
        },
        openProductList() {
            if (!$("#orderFormModal").hasClass("show") && !$("#boardFormModal").hasClass("show") && !mainBoard.movingBoards && mainBoard.boardSelected !== null) {
                $("#orderFormModal").modal("show");
            }
        },

        //#endregion

        //#region Search
        showFoodInfo() {
            $("#foodInfoModal").modal("show");
        },
        containsFood(order) {
            var containsFood = false;
            for (var j = 0; j < order.orderProducts.length; j++) {
                if (order.orderProducts[j].product.isFood) {
                    containsFood = true;
                    break;
                }
            }
            return containsFood;
        },
        getColors() {
            genericListSearch("/api/config/GetColors",
                mainBoard.doneGetColors,
                mainBoard.failGetColors);
        },
        doneGetColors(result) {
            this.colors = result;
        },
        failGetColors(result) {
            bootbox.alert(result.responseText);
        },

        findColor(state) {
            return this.colors[state - 1];
        },

        getBoards() {
            genericListSearch("/api/board/GetBoards",
                mainBoard.doneGetBoards,
                mainBoard.failGetBoards);
        },

        doneGetBoards(result) {
            this.boards = result;
            this.boardsReverse = this.boards.slice().reverse();
            if (this.boardSelected !== null) {
                this.boards.forEach(function (board) {
                    if (board.id === mainBoard.boardSelected.id) {
                        mainBoard.boardSelected = board;
                    }
                });
            }
        },
        failGetBoards(result) {
            bootbox.alert(result);
        },

        getOrderProducts() {
            genericListSearch("/api/order/GetOrderProducts",
                mainBoard.doneGetOrderProducts,
                mainBoard.failGetOrderProducts);
        },

        doneGetOrderProducts(result) {
            this.orderProducts = result;
            this.setNullUnits();
        },
        failGetOrderProducts(result) {
            bootbox.alert(result.responseText);
        },

        getPlaceImage() {
            genericListSearch("/api/config/getPlaceImage",
                function (result) {
                    mainBoard.placeImage = "url('../img/" + result + "'";
                },
                function () {
                    mainBoard.placeImage = "url('../img/vereda.jpg'";
                });
        },

        refresh() {
            this.getColors();
            this.getBoards();
            this.getOrderProducts();
            this.boardSelected = null;
            this.productSelected = null;
        },

        matchSearch(type, products, productFilter) {
            var match = false;
            if (type.includes(productFilter) || productFilter.includes(type)) {
                return true;
            }
            else {
                for (var i = 0; i < products.length; i++) {
                    if (products[i].name.toLowerCase().includes(productFilter) ||
                        productFilter.includes(products[i].name.toLowerCase())) {
                        match = true;
                        break;
                    }
                }
            }
            return match;
        },
        matchTypeOrProduct(type, product, filter) {
            return type.includes(filter) || product.includes(filter) || filter.includes(product) || filter.includes(type);
        },

        //#endregion

        //#region Save
        saveBoard(form) {
            this.boardFormFailMessage = "";
            $(form).validate();
            if (!$(form).valid()) return;
            genericSaveItem("api/board/save",
                JSON.stringify(mainBoard.formBoard),
                mainBoard.doneSaveBoard,
                mainBoard.failSaveBoard);
        },
        saveBoards() {
            this.movingBoards = false;
            genericSaveItemAsync("api/board/savePositions",
                JSON.stringify(mainBoard.boards),
                function () { },
                mainBoard.failSaveBoards);
        },

        saveOrderProducts() {
            var toAdd = { boardId: this.boardSelected.id, products: [] };
            this.orderProducts.forEach(function (type) {
                type.products.forEach(function (product) {
                    if (product.units > 0 && product.units !== null) {
                        toAdd.products.push(product);
                    }
                });
            });
            if (toAdd.products.length === 0)
                return;
            genericSaveItem("/api/order/saveOrderProducts",
                JSON.stringify(toAdd),
                mainBoard.doneSaveOrderProducts,
                mainBoard.failSaveOrderProducts);
        },

        closeOrder() {
            genericBootboxConfirm(
                "¿Desea cobrar y cerrar la mesa?",
                "Cobrar",
                "btn btn-sm btn-success",
                "Cancelar",
                "btn btn-sm btn-link",
                function () {
                    genericSaveItem("/api/order/close",
                        JSON.stringify(mainBoard.boardSelected),
                        function () { mainBoard.getBoards(); },
                        function (result) { bootbox.alert(result.responseText); });
                }
            );
        },
        editOrderName() {
            this.formOrder = Object.assign({}, this.boardSelected.order);
            this.formOrder.orderProducts = [];
            this.orderNameFormFailMessage = "";
            $("#orderNameFormModal").modal("show");
        },
        saveOrderName() {
            this.orderNameFormFailMessage = "";
            genericSaveItemAsync(
                "/api/order/saveOrder",
                JSON.stringify(mainBoard.formOrder),
                function () {
                    mainBoard.boardSelected.order.name = mainBoard.formOrder.name;
                    $("#orderNameFormModal").modal("hide");
                },
                function () {
                    mainBoard.orderNameFormFailMessage = "No se pudo guardar el nombre. Por favor, intente nuevamente.";
                }
            );
        },
        keyDownUnits(indexOP, event) {
            if (event.keyCode === 13) {
                this.saveOrderProduct(indexOP);
            }
        },
        saveOrderProduct(indexOP) {
            if (this.editingUnit.units === "") {
                this.editingUnit.units = 0;
            }
            genericSaveItem("/api/order/saveOrderProduct",
                JSON.stringify(mainBoard.editingUnit),
                function (result) {
                    mainBoard.doneSaveOrderProduct(result, indexOP);
                },
                function (result) { bootbox.alert(result.responseText); });
        },
        doneSaveOrderProduct(result, indexOP) {
            if (result === 0) {
                this.boardSelected.order.orderProducts.splice(indexOP, 1);
                if (this.boardSelected.order.orderProducts.length === 0) {
                    this.boardSelected.order = null;
                    this.boardSelected.state = 1;
                }
            }
            else {
                this.boardSelected.order.orderProducts[indexOP].units = result;
            }
            this.editingUnit = null;
        },
        doneSaveBoard() {
            $("#boardFormModal").modal("hide");
            this.getBoards();
        },
        failSaveBoard(result) {
            this.boardFormFailMessage = result.responseText;
        },
        failSaveBoards() {
            this.movingBoards = true;
            bootbox.alert("Ocurrio un error al guardar las mesas. Por favor, intente nuevamente");
        },

        doneSaveOrderProducts() {
            this.getBoards();
            $("#orderFormModal").modal("hide");
        },
        failSaveOrderProducts(result) {
            bootbox.alert(result.responseText);
        },

        serveAll(order) {
            order.orderProducts.forEach(function (op) {
                op.served = true;
            });
            genericSaveItemAsync(
                "/api/order/serveAll",
                JSON.stringify(order),
                function () { },
                function () { mainBoard.cancelMovingBoards(); }
            );
        },
        serve(orderProduct) {
            genericSaveItemAsync(
                "/api/order/serve",
                JSON.stringify(orderProduct),
                function () { },
                function () { orderProduct.served = !orderProduct.served; }
            );
        },
        editDiscount() {
            this.formOrder = Object.assign({}, this.boardSelected.order);
            this.formOrder.orderProducts = [];
            this.orderDiscountFormFailMessage = "";
            $("#orderDiscountFormModal").modal("show");
        },
        saveDiscount() {
            this.orderDiscountFormFailMessage = "";
            if (this.formOrder.discount < 0) {
                this.orderDiscountFormFailMessage = "El descuento no puede ser menor a cero.";
                return;
            }

            genericSaveItemAsync(
                "/api/order/saveOrder",
                JSON.stringify(mainBoard.formOrder),
                function () {
                    mainBoard.boardSelected.order.discount = mainBoard.formOrder.discount;
                    $("#orderDiscountFormModal").modal("hide");
                },
                function () {
                    mainBoard.orderDiscountFormFailMessage = "No se pudo aplicar el descuento. Por favor, intente nuevamente.";
                }
            );
        },
        transferOrder(targetBoard) {
            if (this.transferingOrder) {
                genericBootboxConfirm("¿Desea mover la orden de la mesa " + mainBoard.boardSelected.identification +
                    " hacia la mesa " + targetBoard.identification + "?",
                    "Mover", "btn btn-sm btn-success", "Cancelar", "btn btn-sm btn-link",
                    function () {
                        mainBoard.boardSelected.order.boardId = targetBoard.id;
                        targetBoard.order = mainBoard.boardSelected.order;
                        targetBoard.order.name = "Orden Mesa " + targetBoard.identification;
                        mainBoard.boardSelected.order = null;
                        targetBoard.state = 2;
                        mainBoard.boardSelected.state = 1;
                        mainBoard.transferingOrder = false;
                        genericSaveItemAsync(
                            "/api/order/transfer",
                            JSON.stringify([mainBoard.boardSelected, targetBoard]),
                            function () { },
                            function () {
                                bootbox.alert("Se produjo un error al mover la orden. Por favor, intente nuevamente.");
                                mainBoard.getBoards();
                                this.transferingOrder = false;
                            });
                    });
            } else {
                this.transferingOrder = true;
            }
        },
        cancelTransferOrder() {
            this.transferingOrder = false;
        },
        //#endregion

        //#region Print
        printVoucher() {
            genericBootboxConfirm(
                "¿Desea imprimir el comprobante?",
                "Imprimir",
                "btn btn-sm btn-success",
                "Cancelar",
                "btn btn-sm btn-link",
                function () {
                    window.open("/Print/Order?id=" + mainBoard.boardSelected.order.id, "_blank");
                }
            );
        },
        //#endregion 

        //#region Cancel
        cancelMovingBoards() {
            this.getBoards();
            this.movingBoards = false;
            this.editingUnit = null;
            this.transferingOrder = false;
        },
        cancelAddOrderProduct() {
            this.setNullUnits();
            this.productSelected = null;
            $("TR.cursorPointer").removeClass("productFocused");
            this.productFilter = "";
        },

        cancelOrder() {
            genericBootboxConfirm("¿Desea cancelar la orden?",
                "Confirmar", "btn btn-sm btn-danger",
                "No", "btn btn-sm btn-link",
                function () {
                    genericSaveItemAsync("/api/order/cancelOrder",
                        JSON.stringify(mainBoard.boardSelected.order),
                        function () { },
                        function () {
                            bootbox.alert("Se produjo un error al cancelar la orden. Por favor, intente nuevamente.");
                            mainBoard.getBoards();
                        });
                    mainBoard.boardSelected.order = null;
                    mainBoard.boardSelected.state = 1;
                });
        },

        //#endregion
        //#region Delete
        deleteBoard() {
            if (this.boardSelected.state === 2 || this.boards.length === 1) {
                bootbox.alert("No se puede eliminar la mesa si es la ultima, o si tiene una orden abierta.")
                return;
            }
            bootbox.confirm({
                message: "<p class='text-center'>¿Seguro desea eliminar la mesa?</p><p class='font-size-small'> La información de las ordenes ya cerradas no se perderá, pero quedarán registradas con otro numero de mesa</p>",
                buttons: {
                    confirm: {
                        label: 'Eliminar',
                        className: 'btn btn-sm btn-danger'
                    },
                    cancel: {
                        label: 'Cancelar',
                        className: 'btn btn-sm btn-link'
                    }
                },
                callback: function (yes) {
                    if (yes) {
                        var id = mainBoard.boardSelected.id;
                        mainBoard.$delete(mainBoard.boards, mainBoard.boards.indexOf(mainBoard.boardSelected));
                        mainBoard.boardSelected = null;
                        $.ajax({
                            url: "/api/Board/Delete/" + id,
                            method: "DELETE"
                        }).fail(function () {
                            bootbox.alert("Hubo un error al eliminar la mesa. Por favor, intente nuevamente.");
                            mainBoard.getBoards();
                        });
                    }
                }
            });
        }
        //#endregion

    },
    computed: {
        totalPrice() {
            var sum = 0;
            this.boardSelected.order.orderProducts.forEach(function (op) {
                sum += op.units * op.product.price;
            });
            return sum - this.boardSelected.order.discount;
        },
        food() {
            var food = [];
            var band = 0;
            this.boards.forEach(function (board) {
                if (board.order !== null) {
                    board.order.orderProducts.forEach(function (op) {
                        if (op.product.isFood && !op.served) {
                            band = 0;
                            for (var i = 0; i < food.length; i++) {
                                //Inserto uno nuevo en Orden 
                                if (food[i].name > op.product.name) {
                                    food.splice(i, 0, { productId: op.product.id, name: op.product.name, units: op.units });
                                    band = 1;
                                    break;
                                }
                                else {
                                    //Sumo unidades al existente
                                    if (food[i].productId === op.product.id) {
                                        food[i].units += op.units;
                                        band = 1;
                                        break;
                                    }
                                }
                            }
                            //Inserto primer elemento si la lista esta vacía, 
                            //o si es el primero en orden alfabético
                            if (band === 0) {
                                food.push({ productId: op.product.id, name: op.product.name, units: op.units });
                            }
                        }
                    });
                }
            });
            return food;
        }
    }
});
//Cuando se carga la pagina
mainBoard.getColors();
mainBoard.getPlaceImage();
mainBoard.getBoards();
mainBoard.getOrderProducts();

//Mover las mesas al hacerle click
$(".outdoorIndoor").on('mousemove', function (e) {
    $('.active').offset({
        top: e.pageY - $('.active').outerHeight() / 2,
        left: e.pageX - $('.active').outerWidth() / 2
    });
});

//Setear en null las unidades de cada producto al cerrar el modal
$("#orderFormModal").on("hide.bs.modal", function () {
    mainBoard.cancelAddOrderProduct();
});

$("#orderFormModal").on("shown.bs.modal", function () {
    $("#orderProductFilter").focus();
});

$("#boardFormModal").on("shown.bs.modal", function () {
    $("input#BoardIdentification").focus();
});

function somethingPendient() {
    return mainBoard.transferingOrder ||
        mainBoard.movingBoards ||
        $("#boardFormModal").hasClass("show") ||
        $("#orderFormModal").hasClass("show") ||
        $("#foodInfoModal").hasClass("show");
}

$(function () {
    //#region Atajos de teclado
    $(document).keydown(function (e) {
        //#region F2
        // Setea el modo "Mover mesas" en true
        if (e.keyCode === 113) {
            if (somethingPendient()) return;
            mainBoard.movingBoards = true;
            return false;
        }
        //#endregion

        //#region F3

        if (e.keyCode === 114) {
            if (somethingPendient()) return;
            mainBoard.editBoard();
            return false;
        }

        //#endregion

        //#region F4

        if (e.keyCode === 115) {
            if (somethingPendient()) return;
            mainBoard.createBoard();
            return false;
        }

        //#endregion

        //#region F7

        if (e.keyCode === 118) {
            if (somethingPendient()) return;
            mainBoard.openProductList();
            return false;
        }

        //#endregion

        //#region Tab
        if (e.keyCode === 9) {
            if (somethingPendient()) return;
            var length = mainBoard.boards.length;
            var i = -1;
            if (mainBoard.boardSelected !== null) {
                i = mainBoard.boards.indexOf(mainBoard.boardSelected);
            } else {
                if (e.shiftKey)
                    i = length;
            }

            //Si tengo el shift apretado las recorro al reves
            var add = 1;
            if (e.shiftKey)
                add = -1;    
            var finded = false;
            i += add;
            while (!finded && i >= 0 && i < length) {
                if (mainBoard.boards[i].state !== 3) {
                    mainBoard.boardSelected = mainBoard.boards[i];
                    finded = true;
                }
                i += add;
            }
            if (!finded)
                mainBoard.boardSelected = null;
            return false;
        }
        //#endregion

        //#region Enter
        
        if (e.keyCode === 13) {
            //Si se estan moviendo las mesas, guarda las posiciones de todas.
            if (mainBoard.movingBoards) {
                $(".board.active").click();
                mainBoard.saveBoards();
                return false;
            } else {
                //Si estoy agregando productos a la orden, guardo los cambios.
                if ($("#orderFormModal").hasClass("show") && !$("#cancelOrderButton").is(':focus')) {
                    mainBoard.saveOrderProducts();
                    return false;
                }
                //Para el resto de los casos no hace falta porque el boton submit esta adentro de un formulario
                //y se activa automaticamente al presionar Enter
            }
            return;
        }
        //#endregion

        //#region Escape
        if (e.keyCode === 27) {
            if (mainBoard.movingBoards) {
                $(".board.active").click();
                mainBoard.cancelMovingBoards();
            } else {
                if (mainBoard.editingUnit !== null) {
                    mainBoard.editingUnit = null;
                }
                if (mainBoard.transferingOrder) {
                    mainBoard.transferingOrder = false;
                }
            }
            return false;
        } 
        //#endregion
    });
    //#endregion 
});