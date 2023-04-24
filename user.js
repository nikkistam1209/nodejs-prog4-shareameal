class User {

    constructor(id, email, firstname, lastname){
        this.id = id;
        this.email = email;
        this.firstname = firstname;
        this.lastname = lastname;
    }

    getId() {
        return this.id;
    }

    getEmail() {
        return this.email;
    }

    getFirstname() {
        return this.firstname;
    }

    getLastname() {
        return this.lastname;
    }
}






module.exports = User;