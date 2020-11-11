//get the user from local storage
const userObj = localStorage.getItem('bookUser');
const user = userObj ? JSON.parse(userObj) : '';
//verify the user has logged in
if (!user || !user.accessToken){
	window.location.href = "index.html";
}
