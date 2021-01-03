class channelValidation{
    //This function is to validate channel specific bugs that may occur in deployment
    static validateChannel(context){
        const channelId = context.activity.channelId;
        var value = context.activity.text;
        
        if(channelId === "slack"){
            
            value = value.substring(
                    context.activity.text.lastIndexOf(":")+1, 
                    context.activity.text.lastIndexOf("|"));
        } 

        return value;

  

    }
};

module.exports.channelValidation = channelValidation;