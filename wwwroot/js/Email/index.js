var mainEmail = new Vue({
    el: "#mainEmail",
    data: {
        email: { id: 0, emailAddress: "" },
        emails: [],
        failMessage: ""
    },
    methods: {
        getEmails() {
            genericListSearch("/api/email/getEmails",
                function (result) {
                    mainEmail.emails = result;
                },
                function () {
                    bootbox.alert("Se produjo un error al recuperar los emails. Por favor, intente nuevamente.");
                }
            );
        },
        addEmail() {
            this.email = { id: 0, emailAddress: "" };
            this.openEmailModal();
        },
        editEmail(email) {
            this.email = { id: email.id, emailAddress: email.emailAddress };
            this.openEmailModal();
        },
        openEmailModal() {
            this.failMessage = "";
            $("#emailFormModal").modal("show");
        },
        saveEmail(form) {
            this.failMessage = "";
            $(form).validate();
            if (!$(form).valid())
                return;
            genericSaveItem("/api/email/saveEmail",
                JSON.stringify(mainEmail.email),
                function (result) {
                    $("#emailFormModal").modal("hide");
                    mainEmail.emails = result;
                },
                function (result) {
                    mainEmail.failMessage = result.responseText;
                }
            );
        },
        deleteEmail(email) {
            genericDeleteItem("/api/email/deleteEmail",
                email.id,
                function () { mainEmail.$delete(mainEmail.emails, mainEmail.emails.indexOf(email));},
                function () { bootbox.alert("No se pudo eliminar el email " + email.emailAddress);}
            );
        }
    }
});

mainEmail.getEmails();
