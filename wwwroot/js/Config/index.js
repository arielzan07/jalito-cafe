var mainConfig = new Vue({
    el: "#mainConfig",
    data: {
        colors: [],
        placeImages: [],
        placeImageSelected: { id: 0, imgName: "vereda.jpg", selected: true },
        editingColors: false,
        editingPlaceImage: false,
        failMessageCreatePlaceImage: ""
    },
    methods: {
        //#region Board Colors
        getColors() {
            genericListSearch("api/config/getColors", mainConfig.doneGetColors, mainConfig.failGetColors);
        },
        doneGetColors(result) {
            this.colors = result;
            this.editingColors = false;
        },
        failGetColors(result) {
            bootbox.alert(result.message);
        },
        saveColors() {
            genericSaveItem(
                "api/config/saveColors",
                JSON.stringify(mainConfig.colors),
                mainConfig.doneSaveColors,
                function (result) { bootbox.alert(result.message); }
            );
        },
        doneSaveColors() {
            this.editingColors = false;
        },
        //#endregion

        //#region Background Images
        getPlaceImages() {
            genericListSearch("api/config/getPlaceImages",
                mainConfig.doneGetPlaceImages,
                function (result) { alert(result.message); }
            );
        },
        doneGetPlaceImages(result) {
            this.placeImages = result;
            if (this.placeImages.length === 0) {
                this.placeImages.push({ id: 0, imgName: "vereda.jpg", selected: true });
            }
            this.findSelectedPlaceImage();
        },
        findSelectedPlaceImage() {
            for (var i = 0; i < mainConfig.placeImages.length; i++) {
                if (mainConfig.placeImages[i].selected) {
                    this.placeImageSelected = mainConfig.placeImages[i];
                    break;
                }
            }
        },
        selectPlaceImage(img, event) {
            if (!$(event.target).hasClass("background-thumbnail"))
                return;
            this.placeImageSelected = img;
            this.editingPlaceImage = true;
        },
        buildPlaceImageStyle(imgName) {
            return "url('../img/" + imgName +"')";
        },
        savePlaceImage() {
            genericSaveItem("/api/config/savePlaceImage",
                JSON.stringify(mainConfig.placeImageSelected),
                function () { mainConfig.editingPlaceImage = false;},
                function () { });
        },

        cancelPlaceImage() {
            this.editingPlaceImage = false;
            this.doneGetPlaceImages(mainConfig.placeImages);
        },
        deletePlaceImage(imgId, index) {
            genericDeleteItem("/api/config/deletePlaceImage",
                imgId,
                function () { mainConfig.$delete(mainConfig.placeImages, index); },
                function (result) { bootbox.alert(result.responseText);});
        },
        newPlaceImage() {
            $("#ImgName").val(null);
            $("#placeImageModal").modal("show");
        },
        createPlaceImage(form) {
            $(form).validate();
            if (!$(form).valid()) return;
            var data = new FormData();
            data.append('file', $("#ImgName")[0].files[0]);
            genericUploadFile("api/config/createPlaceImage",
                data,
                mainConfig.doneCreatePlaceImage,
                mainConfig.failCreatePlaceImage);
        },
        doneCreatePlaceImage() {
            this.getPlaceImages();
            this.failMessageCreatePlaceImage = "";
            $("#placeImageModal").modal("hide");
        },
        failCreatePlaceImage(result) {
            this.failMessageCreatePlaceImage = result.responseText;
        }
        //#endregion

    }
});





var mainDataConfig = new Vue({
    el: "#mainDataConfig",
    data: {
        expenseType: { id: 0, description: "" },
        expenseTypes: [],
        failMessage: ""
    },
    methods: {
        getExpenseTypes() {
            genericListSearch("/api/config/getExpenseTypes",
                function (result) {
                    mainDataConfig.expenseTypes = result;
                },
                function () {
                    bootbox.alert("Se produjo un error al recuperar los tipos de gastos. Por favor, intente nuevamente.");
                }
            );
        },
        addExpenseType() {
            this.expenseType = { id: 0, description: "" };
            this.openExpenseTypeModal();
        },
        editExpenseType(type) {
            this.expenseType = { id: type.id, description: type.description };
            this.openExpenseTypeModal();
        },
        openExpenseTypeModal() {
            this.failMessage = "";
            $("#expenseTypeFormModal").modal("show");
        },
        saveExpenseType(form) {
            this.failMessage = "";
            $(form).validate();
            if (!$(form).valid())
                return;
            genericSaveItem("/api/config/saveExpenseType",
                JSON.stringify(mainDataConfig.expenseType),
                function (result) {
                    $("#expenseTypeFormModal").modal("hide");
                    mainDataConfig.expenseTypes = result;
                },
                function () {
                    mainDataConfig.failMessage = "No se pudo guardar el tipo de gasto. Por favor, intente nuevamente.";
                }
            );
        },
        deleteExpenseType(type) {
            genericDeleteItem("/api/config/deleteExpenseType",
                type.id,
                function () { type.status = 0; },
                function () { bootbox.alert("No se pudo eliminar el tipo " + type.description);}
            );
        },
        restoreExpenseType(type) {
            genericRestoreItem("/api/config/restoreExpenseType",
                type.id,
                function () { type.status = 1; },
                function () { bootbox.alert("No se pudo restaurar el tipo " + type.description); }
            );
        }
    }
});

mainConfig.getColors();
mainConfig.getPlaceImages();
mainDataConfig.getExpenseTypes();