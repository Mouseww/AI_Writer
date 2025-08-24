export const toLocalTime = (dateString: string) => {
    const date = new Date(dateString);
    
const utcDate = new Date(Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds()
  ));
  
    return utcDate.toLocaleString();
};
