module.exports.getDate = function(){
   let date = new Date();
   return date.toLocaleDateString('en-US', options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
   });
};
