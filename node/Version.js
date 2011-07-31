var Version = function() {
}
  
Version.prototype.run = function(future) {  
    future.result = { "version": "1.0", "apiVersion": "1" };
}
