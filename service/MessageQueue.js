const { EventEmitter } = require("events");
const CassandraService = require("./CassandraService");

class MessageQueue extends EventEmitter {
    "use strict";

    constructor(database = new CassandraService()) {
        super();
        this.items = [];
        this.database = database;
        this.on('persist to database', this.persist);
    };

    enqueue(item) {
        this.items.push(item);
        if (this.checkCapacity(5)) {
            this.emit('persist to database');
        }
    }

    checkCapacity(threshold) {
        return this.items.length > threshold;
    }

    flush() {
        // empty queue and persist data to cassandra

    }

    persist() {
        this.database.batch_insert_messages(this.items);
        this.items = [];
    }

    printQueue() { 
        var str = ""; 
        for(var i = 0; i < this.items.length; i++) 
            str += this.items[i] + " "; 
        console.log(str);
    } 

    
}

module.exports = MessageQueue;