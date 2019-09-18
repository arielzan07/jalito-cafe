var productList = new Vue({ 
    el: "#productList",
    data: {
        productTypes: [],
        productsChecked: [],
        toConfirm: [],
        productFilter: "",
        deletedProductFilter: "",
        listFailMessage: "",
        productFormFailMessage: "",
        updatePriceFailMessage: "",
        typeFormFailMessage: "",
        readOnly: false,
        //Objeto Producto
        productTransfer: null,
        //Indice dentro de productType.products
        indexTransfer: null,
        //Indice en productTypes
        typeIndexTransfer: null,
        //draggingDeleted: if false => "mover" // if true => "restuarar".
        draggingDeleted: false,
        checkAllAction: "check",
        updateCondition: {
            priceCondition: true, percent: 1, amount: 0, round: 1
        },
        productSelected: {
            id: 0, name: "", typeId: 0, productType: null, price: null, orders: null, status: 1, isFood: false
        },
        productTypeSelected: {
            id: 0, name: "", products: [], status: 1
        }
    },
    methods: {

        //#region Create
        createProduct(typeId) {
            this.productSelected = {
                id: 0, name: "", typeId: typeId, productType: null, price: null, orders: null, status: 1, isFood: false
            };
            $("#productFormModalLabel").html("Agregar producto");
            $("#productFormModal").modal("show");
        },
        createProductType() {
            this.productTypeSelected = {
                id: 0, name: "", products: [], status: 1
            };
            $("#productTypeFormModalLabel").html("Agregar Categoría");
            $("#productTypeFormModal").modal("show");
        },
        //#endregion

        //#region Select
        selectProduct(product) {
            //VER
            this.productSelected = Object.assign({}, product);
            $("#productFormModalLabel").html("Modificar " + product.name);
        },
        selectProductType(productType) {
            //VER
            this.productTypeSelected = Object.assign({}, productType);
            $("#productTypeFormModalLabel").html("Modificar " + productType.name);
        },
        //#endregion

        //#region Check
        toggleCheck(id) {
            if (!this.productsChecked.includes(id))
                this.productsChecked.push(id);
            else
                this.uncheck(id);
        },
        check(id) {
            if (!this.productsChecked.includes(id))
                this.productsChecked.push(id);
        },
        uncheck(id) {
            this.$delete(productList.productsChecked, productList.productsChecked.indexOf(id));
        },
        toggleCheckAll() {
            this.checkAllAction = "uncheck";
            this.productTypes.forEach(function (type) {
                if (type.status === 1) {
                    type.products.forEach(function (product) {
                        if (product.status === 1 && product.name.toLowerCase().includes(productList.productFilter.toLowerCase())) {
                            if (!productList.productsChecked.includes(product.id)) {
                                productList.checkAllAction = "check";
                                return;
                            }
                        }
                    });
                    if (productList.checkAllAction === "check") return;
                }
            });
            if (productList.checkAllAction === "check")
                this.checkAll();
            else
                this.uncheckAll();
        },
        checkAll() {
            this.productTypes.forEach(function (type) {
                if (type.status === 1) {
                    type.products.forEach(function (product) {
                        if (product.status === 1 && product.name.toLowerCase().includes(productList.productFilter.toLowerCase()))
                            productList.check(product.id);
                    });
                }
            });
        },
        uncheckAll() {
            this.productTypes.forEach(function (type) {
                if (type.status === 1) {
                    type.products.forEach(function (product) {
                        if (product.status === 1 && product.name.toLowerCase().includes(productList.productFilter.toLowerCase()))
                            productList.uncheck(product.id);
                    });
                }
            });
        },
        //#endregion

        //#region UpdatePrice
        showUpdatePriceModal() {
            this.updateCondition = { priceCondition: true, percent: 1, amount: 0, round: 1 };
            productList.toConfirm = [];
            $("#updatePriceModal").modal('show');
        },
        updatePrice(form) {
            $(form).validate();
            if (!$(form).valid()) return;
            genericSaveItem("api/product/updatePrice",
                JSON.stringify({ids: productList.productsChecked,
                                condition: productList.updateCondition}),
                function (result) { productList.toConfirm = result; },
                function (result) { productList.updatePriceFailMessage = result.statusText; });
        },
        confirmUpdatePrice() {
            genericSaveItem("api/product/saveMany",
                JSON.stringify(productList.toConfirm),
                productList.doneConfirmUpdate,
                productList.failConfirmUpdate);
        },
        doneConfirmUpdate() {
            this.getProductTypeList();
            $("#updatePriceModal").modal("hide");
            this.updateCondition = { updateType: 1, percent: 1, amount: 0, round: 1 };
            this.updatePriceFailMessage = "";
        },
        failConfirmUpdate(result) {
            productList.updatePriceFailMessage = result.statusText;
        },
        //#endregion

        //#region Search
        getProductTypeList() {
            genericListSearch(
                "/api/productType/GetList",
                productList.doneTypeSearch,
                productList.failTypeSearch
            );
        },
        doneTypeSearch(result) {
            this.productTypes = result;
            this.listFailMessage = "";
        },
        failTypeSearch(result) {
            this.productTypes = [];
            this.listFailMessage = result.statusText;
        },
        //#endregion        

        //#region Save
        saveProduct(form) {
            $(form).validate();
            if (!$(form).valid()) return;
            genericSaveItem(
                "/api/product/save",
                JSON.stringify(productList.productSelected),
                productList.doneProductForm,
                productList.failProductForm
            );
        },
        saveProductType(form) {
            $(form).validate();
            if (!$(form).valid()) return;
            productList.productTypeSelected.products = [];
            genericSaveItem(
                "/api/productType/save",
                JSON.stringify(productList.productTypeSelected),
                productList.doneTypeForm,
                productList.failTypeForm
            );
        },
        doneProductForm(result) {
            $("#productFormModal").modal("hide");
            this.productFormFailMessage = "";
            this.productTypes = result;
        },
        failProductForm(result) {
            this.productFormFailMessage = result.statusText;
        },
        doneTypeForm(result) {
            $("#productTypeFormModal").modal("hide");
            this.typeFormFailMessage = "";
            this.productTypes = result;
        },
        failTypeForm(result) {
            this.typeFormFailMessage(result.statusText);
        },
        //#endregion

        //#region  Delete
        deleteProduct(id, typeIndex, productIndex) {
            genericDeleteItem(
                "/api/product/delete",
                id,
                function () {
                    productList.doneDeleteProduct(typeIndex, id, productIndex);
                },
                productList.failDeleteProduct);
        },
        deleteProductType(id, index) {
            genericDeleteItem(
                "/api/productType/delete",
                id,
                function () { productList.doneDeleteType(index); },
                productList.failDeleteProduct
            );
        },
        deleteProducts() {
            genericDeleteItems("/api/product/delete",
                JSON.stringify(productList.productsChecked),
                productList.doneDeleteProducts,
                productList.failDeleteProducts
            );
        },
        doneDeleteProducts() {
            this.getProductTypeList();
            this.productsChecked = [];
        },
        failDeleteProducts(result) {
            bootbox.alert(result.statusText);
        },
        doneDeleteType(index) {
            var pt = this.productTypes[index];
            //Elimino el tipo
            pt.status = 0;
            //Mando todos sus productos a la papelera
            pt.products.forEach(function (product) {
                product.status = 0;
            });
            //Elimino de la lista de checkeados los productos que estaban en ese tipo
            pt.products.forEach(function (product) {
                productList.$delete(productList.productsChecked, productList.productsChecked.indexOf(product.id));
            });
        },
        failDeleteType(result) {
            bootbox.alert(result.statusText);
        },
        doneDeleteProduct(typeIndex, id, productIndex) {
            this.productTypes[typeIndex].products[productIndex].status = 0;
            this.$delete(productList.productsChecked, productList.productsChecked.indexOf(id));
        },
        failDeleteProduct(result) {
            bootbox.alert(result.statusText);
        },
        //#endregion

        //#region Drag and Drop
        drag(product, productIndex, typeIndex, draggingDeleted) {
            this.productTransfer = product;
            this.indexTransfer = productIndex;
            this.typeIndexTransfer = typeIndex;
            this.draggingDeleted = draggingDeleted;
        },
        drop(index) {
            $(".typeCard").removeClass("shadow-lg rounded");
            if (this.productTypes[index].products === null) {
                this.productTypes[index].products = [];
            }
            this.productTransfer.status = 1;
            if (!this.productTypes[index].products.includes(this.productTransfer)) {
                this.productTransfer.typeId = this.productTypes[index].id;
            }
            genericSaveItem("/api/product/save",
                JSON.stringify(productList.productTransfer),
                function () { productList.doneDrop(index); },
                productList.failDrop);

        },
        doneDrop(index) {
            //Elimino el producto del tipo de origen
            this.$delete(productList.productTypes[productList.typeIndexTransfer].products, productList.indexTransfer);

            //Agrego el producto al tipo destino
            this.productTypes[index].products.push(productList.productTransfer);

            //Si estoy restaurando vuelvo a mostrar el modal
            if (this.draggingDeleted) {
                $("#deletedProductModal").modal("show");
            }
        },
        failDrop(result) {
            bootbox.alert(result.statusText);
            this.drag(null, null, null, 0);
        },

        //#endregion

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
        }
    }
});
productList.getProductTypeList();
function dragModal(event) {
    event.preventDefault();
    $("#deletedProductModal").modal("hide");
}
function dragOverType(event) {
    event.preventDefault();
    $(event.target).parents(".typeCard").addClass("shadow-lg rounded");
}
function dragLeaveType(event) {
    $(event.target).parents(".typeCard").removeClass("shadow-lg rounded");
}
$('#productFormModal').on('shown.bs.modal', function () {
    $('input#Name').focus();
});
$('#productTypeFormModal').on('shown.bs.modal', function () {
    $('input#Name').focus();
});
