var activeNavLink;
var umodal;
var session = {};

// MAIN FUNCTIONS
//Create
function Create(type, cl, parent, html = null, attributes = null, prepend = false) {
	var elem = document.createElement(type);
	if (cl != null) {
		elem.className = cl;
	}
	if (html != null) {
		elem.innerHTML = html;
	}
	if (parent != null) {
		if (prepend) parent.prepend(elem)
		else parent.appendChild(elem);
	}
	if (attributes != null){
		for (var a in attributes) {
			elem.setAttribute(a, attributes[a]);
		}
	}
	return elem;
}

//GetRequest
function GetRequest(dataUrl, onLoad = null, onProgress = null, onError = null) {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function () {
		if (xmlHttp.readyState == 4) {
			if (onLoad != null && xmlHttp.status == 200) {onLoad(JSON.parse(xmlHttp.responseText));}
			else if (onError != null && xmlHttp.status != 200) { onError(xmlHttp.status); }
		}
	}
	xmlHttp.onerror = function (event) { if (onError != null) { onError(xmlHttp.status); } }
	xmlHttp.onprogress = function (event) { if (onProgress != null) { onProgress(event.loaded, event.total); } }
	xmlHttp.open("GET", dataUrl, true);
	xmlHttp.send(null);
}

//setActiveNavlink
function setActiveNavlink() {
	var navlinks = document.getElementsByClassName("navbar-link");

	var navHandlers = {
		"nav-projects": showProjects,
		"nav-brigades": showBrigades,
		"nav-clients": showClients,
		"nav-orders": showOrders,
		"nav-addworks": showAddWorks,
		"nav-exit": stopSession
	};

	if (navlinks.length == 0) return;

	for (var i = 0; i < navlinks.length; i++) {
		navlinks[i].onclick = function () {
			if (activeNavLink != null) activeNavLink.classList.remove("active");
			this.classList.add("active");
			activeNavLink = this;
		};
	}

	for (var nav in navHandlers){
		var navlink = document.getElementById(nav);
		navlink.addEventListener("click", navHandlers[nav]);
	}

	navlinks[0].click();
}

// Umodal
function uModal(title, ubody = true, ufooter = true, uclose = true, closeByClick = false) {
	document.body.style.overflow = "hidden";

	if (umodal != null && umodal.parentNode != null) {
		umodal.parentNode.removeChild(umodal);
	}

	umodal = Create("div", "umodal", document.body);

	umodal.onclick = function (event) {
		if (event.target == this && closeByClick) {
			document.body.style.overflow = "auto";
			document.body.removeChild(umodal);
		}
	}
	umodal.uframe = Create("div", "umodal-frame box", umodal);
	if (title != null) {
		umodal.utop = Create("div", "header", umodal.uframe, title);
		if (uclose) {
			umodal.utop.uclose = Create("div", "uclose", umodal.utop, '<i class="fa-solid fa-xmark"></i>');
			umodal.utop.uclose.onclick = function () {
				document.body.style.overflow = "auto";
				document.body.removeChild(umodal);
			}
		}
	}
	if (ubody) { umodal.ubody = Create("div", "body", umodal.uframe); }
	if (ufooter) { umodal.ufooter = Create("div", "footer", umodal.uframe); }

	umodal.setIcon = function (icon) {
		if (umodal.utop != null) {
			umodal.utop.className = "header header-icon";
			umodal.utop.style.backgroundImage = "url('" + icon + "')";
		}
	}

	if (!ufooter) {
		umodal.ubody.style.borderRadius = "0 0 6px 6px";
	}
}

//closeUmodal
function closeUmodal() {
	document.body.style.overflow = "auto";
	document.body.removeChild(umodal);
}

// clearContainer
function clearContainer() {
	var container = document.getElementsByClassName("container")[0];
	container.innerHTML = "";
}

// window.onload
window.onload =  async function() {
	if(window.location.href.endsWith('adminboard.html')) {
		setActiveNavlink();
	}
	else {
		showProjectsForClient();
	}
	startSession();
	parseUserData();
	brigades_update();
}

// formHandler
function formHandler(_url, _success, _id = '_form')
{
	$(umodal).ready(function () {
		$("#" + _id).submit(function () {
			var formID = _id;
			var formNm = $('#' + formID);
			var formData = new FormData();
			var serialized = formNm.serializeArray();

			for (var i = 0; i < serialized.length; i++) {
				if (serialized[i]['name'] != 'file'){
					formData.append(serialized[i]['name'], serialized[i]['value']);
				}
			}
			
			if ($("#js-file").length) formData.append('file', $("#js-file")[0].files[0]);
			
			$.ajax({
				type: "POST",
				url: _url,
				data: formData,
				contentType: false,
				processData: false,
				success: function(data) {
					_success(JSON.parse(data))
				}
			});
			return false;
		});
	});
}

// configureFileInput
function configureFileInput() {
	var fileInputs = document.querySelectorAll('input[type="file"]');
	
	for (var i = 0; i < fileInputs.length; i++) {
		var input = fileInputs[i];
		input.addEventListener('change', function (e) {
			var file = e.target.files[0];
			var text = document.getElementsByClassName("input-file-text")[0];
			text.innerHTML = file.name.substring(0, 30);
			if (file.name.length > 30) text.innerHTML += "...";
		});
	}
}

// getSession
function startSession() {
	GetRequest('/scripts/getSessionInfo.php', function(data){
		session = data;
	});
}

// stopSession
function stopSession() {
	GetRequest('/scripts/stopSession.php', function(data){
		if (data['status'] == 'ok') notification('Информация', data['msg']);
		setTimeout(() => window.location.replace('http://s96458su.beget.tech/'), 2000);
	});
}

// parseUserData 
function parseUserData() {
	var authContainer = document.getElementsByClassName('user-authorization')[0];

	try {
		authContainer.onclick = function() {
			if (session['user_id'] == null) loginWindow();
			else if (session['user_id'] != -1) showUsersData();
			else window.location.replace('http://s96458su.beget.tech/adminboard.html');
		}
	}
	catch (e) {};
}

//SUPP_FUNCTIONS
// cost_in_rubles
function normalizeCost(cost) {
	return new Intl.NumberFormat("ru").format(cost);
}

// ru-date
function normalizeDate(date) {
	var ruDate = date.split('-');
	return ruDate[2] + '.' + ruDate[1] + '.' + ruDate[0];
}

// phone validation
function phoneInputValidate() {
	var phoneInputs = document.querySelectorAll('input[type="tel"]');

	var getInputNumbersValue = function (input) {
		return input.value.replace(/\D/g, '');
	}

	var onPhonePaste = function (e) {
		var input = e.target,
			inputNumbersValue = getInputNumbersValue(input);
		var pasted = e.clipboardData || window.clipboardData;
		if (pasted) {
			var pastedText = pasted.getData('Text');
			if (/\D/g.test(pastedText)) {
				input.value = inputNumbersValue;
				return;
			}
		}
	}

	var onPhoneInput = function (e) {
		var input = e.target,
			inputNumbersValue = getInputNumbersValue(input),
			selectionStart = input.selectionStart,
			formattedInputValue = "";

		if (!inputNumbersValue) {
			return input.value = "";
		}

		if (input.value.length != selectionStart) {
			if (e.data && /\D/g.test(e.data)) {
				input.value = inputNumbersValue;
			}
			return;
		}

		if (["7", "8", "9"].indexOf(inputNumbersValue[0]) > -1) {
			if (inputNumbersValue[0] == "9") inputNumbersValue = "7" + inputNumbersValue;
			var firstSymbols = (inputNumbersValue[0] == "8") ? "8" : "+7";
			formattedInputValue = input.value = firstSymbols + " ";
			if (inputNumbersValue.length > 1) {
				formattedInputValue += '(' + inputNumbersValue.substring(1, 4);
			}
			if (inputNumbersValue.length >= 5) {
				formattedInputValue += ') ' + inputNumbersValue.substring(4, 7);
			}
			if (inputNumbersValue.length >= 8) {
				formattedInputValue += '-' + inputNumbersValue.substring(7, 9);
			}
			if (inputNumbersValue.length >= 10) {
				formattedInputValue += '-' + inputNumbersValue.substring(9, 11);
			}
		} else {
			formattedInputValue = '+' + inputNumbersValue.substring(0, 16);
		}
		input.value = formattedInputValue;
	}
	var onPhoneKeyDown = function (e) {
		var inputValue = e.target.value.replace(/\D/g, '');
		if (e.keyCode == 8 && inputValue.length == 1) {
			e.target.value = "";
		}
	}
	for (var phoneInput of phoneInputs) {
		phoneInput.addEventListener('keydown', onPhoneKeyDown);
		phoneInput.addEventListener('input', onPhoneInput, false);
		phoneInput.addEventListener('paste', onPhonePaste, false);
	}
}

// notifications
function notification(_title, _text, _interval = 7000) {
	new Toast({
		title: _title,
		text: _text,
		theme: 'light',
		autohide: true,
		interval: _interval
	});
}


// notifications
function notification_error(_title, _text, _interval = 7000) {
	new Toast({
		title: _title,
		text: _text,
		theme: 'danger',
		autohide: true,
		interval: _interval
	});
}

// Brigade_Update
function brigades_update() {
	GetRequest("/scripts/updateBrigades.php");
}

//ADMIN PAGE
// showProjects
function showProjects() {
	clearContainer();

	GetRequest("/scripts/getProjects.php", function(data) {
		var container = document.getElementsByClassName("container")[0];
		var list = Create('div', 'houses-list', container);

		for (var p in data) {
			var project = data[p];

			var house = Create('div', 'house', list);
			house.setAttribute("data-projectID", project['Project_Id']);
			house.onclick = function() {
				var project_id = this.getAttribute("data-projectID");
				editProjectInfoWindow(project_id);
			}
			Create('div', 'house-img', house, `<img src="${project['Img']}">`);
			Create('div', 'house-name', house, project['Project_Name']);
			var description = Create('div', 'house-description', house);
			
			var row = Create('div', 'house-description-row', description);
			Create('div', 'house-description-key', row, 'Основание');
			Create('div', 'house-description-value', row, project['House_Foundation_Material']);

			var row = Create('div', 'house-description-row', description);
			Create('div', 'house-description-key', row, 'Площадь');
			Create('div', 'house-description-value', row, project['House_Size'] + ' м^2');

			var row = Create('div', 'house-description-row', description);
			Create('div', 'house-description-key', row, 'Стоимость');
			Create('div', 'house-description-value', row, normalizeCost(project['Project_Price']) + ' ₽');
		}
		
		var add = Create('div', 'add-house', list);
		add.onclick = addNewProjectWindow;
		Create('div', 'add-house-img', add, `<img src="/img/addpic/add-house.png">`);
		var description = Create('div', 'add-house-description', add);
		Create('div', 'add-house-description-row', description, 'Добавить проект');
		Create('div', 'add-house-description-row', description, `<img src="/img/addpic/add-house-2.png">`);
	});
}

// showClients
function showClients() {
	clearContainer();

	GetRequest("/scripts/getClients.php", function(data) {
		var container = document.getElementsByClassName('container')[0];
		var list = Create('div', 'clients-list', container);

		Create('div', 'list-title', list, 'Информация о клиентах');

		var description = Create('div', 'client-description', list);
		var row  = Create('div', 'client-description-row-title', description);
		Create('div', 'client-description-key', row, 'Ф.И.О. клиента');
		Create('div', 'client-description-key', row, 'Номер телефона');
		Create('div', 'client-description-key', row, 'Электронная почта');

		for(var c in data)
		{
			var client = data[c];
			var row  = Create('div', 'client-description-row', description);
			row.setAttribute("data-clientID", client["Client_Id"]);
			row.onclick = function() {
				var client_id = this.getAttribute("data-clientID");
				clientInfoWindow(client_id);
			}
			Create('div', 'client-description-value', row, client['FIO']);
			Create('div', 'client-description-value', row, client['Phone_Number']);
			Create('div', 'client-description-value', row, client['Mail']);
		}
	});
}

// showBrigades
function showBrigades() {
	clearContainer();

	GetRequest("/scripts/getBrigades.php", function(data) {
		var container = document.getElementsByClassName('container')[0];
		var list = Create('div', 'brigades-list', container);

		Create('div', 'list-title', list, 'Информация о бригадах');

		var description = Create('div', 'brigade-description', list);
		var row  = Create('div', 'brigade-description-row-title', description);
		Create('div', 'brigade-description-key', row, 'Номер бригады');
		Create('div', 'brigade-description-key', row, 'Ф.И.О. руководителя');
		Create('div', 'brigade-description-key', row, 'Состояние бригады');

		for(var b in data)
		{
			var brigade = data[b];
			var row  = Create('div', 'brigade-description-row', description);
			row.setAttribute("data-brigadeID", brigade["Brigade_Id"]);
			row.onclick = function() {
				var brigade_id = this.getAttribute("data-brigadeID");
				brigadeInfoWindow(brigade_id);
			}
			Create('div', 'brigade-description-value', row, brigade['Brigade_Id']);
			Create('div', 'brigade-description-value', row, brigade['FIO']);
			Create('div', 'brigade-description-value', row, brigade['Busyness']);
		}

		var add = Create('div', 'add-brigade', list);
		add.onclick = addNewBrigadeWindow;
		Create('div', 'add-brigade-img', add, `<img src="/img/addpic/add-brigade.png">`);
		var description = Create('div', 'add-brigade-description', add);
		Create('div', 'add-brigade-description-row', description, 'Добавить бригаду');
	});
}

// showOrders
function showOrders() {
	clearContainer();

	GetRequest("/scripts/getOrders.php", function(data) {
		var container = document.getElementsByClassName('container')[0];
		var list = Create('div', 'orders-list', container);

		Create('div', 'list-title', list, 'Информация о заказах');

		var description = Create('div', 'order-description', list);
		var row = Create('div', 'order-description-row-title', description);
		Create('div', 'order-description-key', row, 'Номер заказа');
		Create('div', 'order-description-key', row, 'Начало выполнения');
		Create('div', 'order-description-key', row, 'Окончание выполнения');

		for(var o in data)
		{
			var order = data[o];
			var row  = Create('div', 'order-description-row', description);
			row.setAttribute("data-orderID", order['Order_Id']);
			row.onclick = function() {
				var order_id = this.getAttribute("data-orderID");
				orderInfoWindow(order_id);
			}
			Create('div', 'order-description-value', row, order['Order_Id']);
			Create('div', 'order-description-value', row, normalizeDate(order['Date_Of_Start']));
			Create('div', 'order-description-value', row, normalizeDate(order['Date_Of_End']));
		}
	});
}

// showAddWorks
function showAddWorks() {
	clearContainer();

	GetRequest("/scripts/getAddworks.php", function(data) {
		var container = document.getElementsByClassName('container')[0];
		var list = Create('div', 'add-works-list', container);

		Create('div', 'list-title', list, 'Информация о дополнительных услугах');

		var description = Create('div', 'add-works-description', list);
		var row = Create('div', 'add-works-description-row-title', description);
		Create('div', 'add-works-description-key', row, 'Наименование услуги');
		Create('div', 'add-works-description-key', row, 'Стоимость услуги');
		Create('div', 'add-works-description-key', row, 'Тип материала');

		for(var a in data)
		{
			var addwork = data[a];
			var row  = Create('div', 'add-works-description-row', description);
			row.setAttribute("data-addworkID", addwork['Work_Id']);
			row.onclick = function() {
				var addwork_id = this.getAttribute("data-addworkID");
				addworkInfoWindow(addwork_id);
			}
			Create('div', 'add-works-description-value', row, addwork['Work_Name']);
			Create('div', 'add-works-description-value', row, normalizeCost(addwork['Full_Price']) + ' ₽');
			Create('div', 'add-works-description-value', row, addwork['Material_Name']);
		}

		var add = Create('div', 'add-addwork', list);
		add.onclick = addNewAddworkWindow;
		Create('div', 'add-addhouse-img', add, `<img src="/img/addpic/add-addwork.png">`);
		var description = Create('div', 'add-addwork-description', add);
		Create('div', 'add-addwork-description-row', description, 'Добавить услугу');
	});
}

// CLIENTS PAGE
// showUsersData
function showUsersData() {
	clearContainer();
	
	GetRequest(`/scripts/getUsersOrders.php?id=${session['user_id']}`, function(data) {
		var container = document.getElementsByClassName('container')[0];
		var list = Create('div', 'orders-list', container);
		Create('div', 'data-page', list, 'Личный кабинет');
		if (data[0]['Order_Id'] != 0) {
			Create('div', 'list-title', list, 'Информация о ваших заказах');
	
			var description = Create('div', 'order-description', list);
			var row = Create('div', 'order-description-row-title', description);
			Create('div', 'order-description-key', row, 'Номер заказа');
			Create('div', 'order-description-key', row, 'Начало выполнения');
			Create('div', 'order-description-key', row, 'Окончание выполнения');
	
			for(var o in data) {
				var order = data[o];
				var row  = Create('div', 'order-description-row', description);
				row.setAttribute("data-orderID", order['Order_Id']);
				row.onclick = function() {
					var order_id = this.getAttribute("data-orderID");
					orderInfoWindow(order_id);
				}
				Create('div', 'order-description-value', row, order['Order_Id']);
				Create('div', 'order-description-value', row, normalizeDate(order['Date_Of_Start']));
				Create('div', 'order-description-value', row, normalizeDate(order['Date_Of_End']));
			}
		}
		else if (data[0]['Order_Id'] == 0) { 
			Create('div', 'list-title', list, 'У вас пока нет заказов &#128532'); 
		}

		var buttons = Create('div', 'buttons-in-user-data', list);
		var userInf = Create('supp_button', null, buttons, 'Редактировать личные данные');
		var mainPage = Create('supp_button', null, buttons, 'Перейти на главную страницу');
		var exit = Create('supp_button', null, buttons, 'Выйти из системы');

		userInf.onclick = function() {
			editUserData();
		}

		mainPage.onclick = function() {
			showProjectsForClient();
		}
		exit.onclick = function() {
			stopSession();
		}
	});
}

// showAddworksForClient
function showAddworksForClient(additionalworks, project_id, project_price, project_name, total_price, brigade_id) {
	clearContainer();
	GetRequest("/scripts/getAddworks.php", function(data) {
		var container = document.getElementsByClassName('container')[0];
		var list = Create('div', 'add-works-list', container);

		Create('div', 'list-title', list, 'Список дополнительных услуг');

		var description = Create('div', 'add-works-description', list);
		var row = Create('div', 'add-works-description-row-title', description);
		Create('div', 'add-works-description-key', row, 'Наименование услуги');
		Create('div', 'add-works-description-key', row, 'Стоимость услуги');
		Create('div', 'add-works-description-key', row, 'Тип материала');

		for(var a in data)
		{
			var addwork = data[a];
			var row  = Create('div', 'add-works-description-row', description);
			row.setAttribute("data-addworkID", addwork['Work_Id']);
			row.onclick = function() {
				var addwork_id = this.getAttribute("data-addworkID");
				addworkForClientInfoWindow(addwork_id, additionalworks, total_price);
			}
			Create('div', 'add-works-description-value', row, addwork['Work_Name']);
			Create('div', 'add-works-description-value', row, normalizeCost(addwork['Full_Price']) + ' ₽');
			Create('div', 'add-works-description-value', row, addwork['Material_Name']);
		}
		var buttons = Create('div', 'buttons-get-order', list);
		var confirm = Create('supp_button', null, buttons, 'Оформить заказ', {'style': 'margin-top: 30px'});
		confirm.onclick = function() {
			uModal("Подтверждение заказа", true, false, true, false);
			var body = umodal.ubody;
			Create("div", "personal-data-enter", body, 'Для завершения оформления Вашего заказа ознакомьтесь с информацией и нажмите на кнопку "Подтвердить заказ" :');
			total_price = project_price;
			total_price_int = parseInt(total_price);
			var tot_cost = Create('div', 'personal-data-total', body);
			Create("div", "personal-data-key-total", tot_cost, 'Итоговая стоимость');
			var personalData = Create("div", "personal-data", body);
			Create("div", "personal-data-key", personalData, 'Наименование проекта дома');
			Create("div", "personal-data-value", personalData, project_name);
			Create("div", "personal-data-key", personalData, 'Стоимость проекта дома');
			Create("div", "personal-data-value", personalData, normalizeCost(project_price) + ' ₽');

			if (additionalworks.length != 0) {
				var additionalWorks = Create('div', 'personal-data', body);
				Create('div', 'personal-data-key', additionalWorks, 'Дополнительные услуги');
	
				for (var i = 0; i < additionalworks.length; i++)
				{
					var addWorkInfo = `${additionalworks[i]['Work_Name']} x${additionalworks[i]['Type_Of_Work_Amount']} (${normalizeCost(additionalworks[i]['Total_Addworks'])} ₽)`;
					Create('div', 'personal-data-value', additionalWorks, addWorkInfo);
					total_price_int+= parseInt(additionalworks[i]['Total_Addworks']);
 				}
			}

			Create("div", "personal-data-value-total", tot_cost, normalizeCost(total_price_int) + ' ₽');

			var buttons = Create('div', 'buttons', body);
			var setOrder = Create('supp_button', null, buttons, 'Подтвердить заказ');
			var del = Create('ref', null, buttons, 'Удалить дополнительные работы');
			del.onclick = function() {
				while (additionalworks.length) {
					additionalworks.pop();
				}
				closeUmodal();
				$(confirm.onclick);
			};

			setOrder.onclick = function () {
				GetRequest(`/scripts/setOrderWithAddworks.php?id=${project_id} & addworks=${encodeURIComponent(JSON.stringify(additionalworks))} & brigade_id=${brigade_id}`, function(data) {
					if (data['status'] == 'ok'){
						closeUmodal();
						$(showUsersData).click();
					}
					notification('Информация', data['msg']);
				});
			}
		}
	});
}

// showProjectsForClient
function showProjectsForClient() {
	clearContainer();

	GetRequest("/scripts/getProjects.php", function(data) {
		var container = document.getElementsByClassName("container")[0];
		var list = Create('div', 'houses-list', container);

		for (var p in data) {
			var project = data[p];

			var house = Create('div', 'house', list);
			house.setAttribute("data-projectID", project['Project_Id']);
			house.onclick = function() {
				var project_id = this.getAttribute("data-projectID");
				getProjectInfoForClient(project_id);
			}
			Create('div', 'house-img', house, `<img src="${project['Img']}">`);
			Create('div', 'house-name', house, project['Project_Name']);
			var description = Create('div', 'house-description', house);
			
			var row = Create('div', 'house-description-row', description);
			Create('div', 'house-description-key', row, 'Основание');
			Create('div', 'house-description-value', row, project['House_Foundation_Material']);

			var row = Create('div', 'house-description-row', description);
			Create('div', 'house-description-key', row, 'Площадь');
			Create('div', 'house-description-value', row, project['House_Size'] + ' м^2');

			var row = Create('div', 'house-description-row', description);
			Create('div', 'house-description-key', row, 'Стоимость');
			Create('div', 'house-description-value', row, normalizeCost(project['Project_Price']) + ' ₽');
		}
	});
}

//getProjectInfoForClient
function getProjectInfoForClient(project_id) {
	clearContainer();

	GetRequest(`/scripts/getProject.php?id=${project_id}`, function(data) {
		let project_name = data['Project_Name'];
		let project_price = data['Project_Price'];
		let brigade_id;
		let total_price;
		let additionalworks = [];

		var container = document.getElementsByClassName("container")[0];
		var list = Create('div', 'client-house-list', container);
		
		Create('div','client-house-list-title', list, data['Project_Name']);

		var block = Create('div', 'client-house-list-block', list);
		Create('div', 'client-house-list-block-img', block, `<img src="${data['Img']}">`);
		
		var column = Create('div', 'client-house-list-block-column', block);

		var row = Create('div', 'client-house-list-block-column-row', column);

		Create('div', 'client-house-list-block-column-row-key', row, 'Метраж');
		Create('div', 'client-house-list-block-column-row-value', row, data['House_Size'] + 'м^2');

		var row = Create('div', 'client-house-list-block-column-row', column);
		Create('div', 'client-house-list-block-column-row-key', row, 'Основание');
		Create('div', 'client-house-list-block-column-row-value', row, data['House_Foundation_Material']);

		var row = Create('div', 'client-house-list-block-column-row', column);
		Create('div', 'client-house-list-block-column-row-key', row, 'Отделка');
		Create('div', 'client-house-list-block-column-row-value', row, data['House_Cover_Material']);

		var row = Create('div', 'client-house-list-block-column-row', column);
		Create('div', 'client-house-list-block-column-row-key', row, 'Крыша');
		Create('div', 'client-house-list-block-column-row-value', row, data['House_Roof_Material']);

		var row = Create('div', 'client-house-list-block-column-row', column);
		Create('div', 'client-house-list-block-column-row-key', row, 'Цена');
		Create('div', 'client-house-list-block-column-row-value', row, normalizeCost(data['Project_Price']) + ' ₽');

		var row = Create('div', 'client-house-list-block-column-row', column);
		Create('div', 'client-house-list-block-column-row-key', row, 'Время строительства');
		Create('div', 'client-house-list-block-column-row-value', row, data['Time_Of_Building'] + ' дней');
		
		var buttons = Create('div', 'buttons-get-order', container);
		var buy = Create('supp_button', null, buttons, 'Оформить заказ проекта');
		
		buy.onclick = function() {
			GetRequest(`/scripts/checkFreeBrigade.php`, function(data) {
				brigade_id = data['brigade_id'];
				if(data['status'] == 'error')
				{
					notification('Информация', data['msg']);
					uModal("Уведомление", true, false, true, false);
					var body = umodal.ubody;
					Create("div", "personal-data-enter", body, 'Извините, но на данный момент остуствуют свободные бригады для начала выполнения работ.');
					Create("div", "personal-data-enter", body, `Хотите сделать заказ на ближайшее свободное число (${data['date']}) ?`);

					var buttons = Create('div', 'buttons-order-window', body);
					var yesButt = Create('get', null, buttons, 'Продолжить оформление');
					var noButt = Create('get', null, buttons, 'Отказаться');

					yesButt.onclick = function() {
						closeUmodal();
						uModal("Подтверждение заказа", true, false, true, false);
						var body = umodal.ubody;
						Create("div", "personal-data-enter", body, 'Для завершения оформления Вашего заказа ознакомьтесь с информацией и нажмите на кнопку "Подтвердить заказ" :');
						var personalData = Create("div", "personal-data", body);
						var tot_cost = Create('div', 'personal-data-total', body);
						Create("div", "personal-data-key-total", tot_cost, 'Итоговая стоимость');
						Create("div", "personal-data-value-total", tot_cost, normalizeCost(project_price) + ' ₽');
						var personalData = Create("div", "personal-data", body);
						Create("div", "personal-data-key", personalData, 'Наименование проекта дома');
						Create("div", "personal-data-value", personalData, project_name);
						Create("div", "personal-data-key", personalData, 'Стоимость проекта дома');
						Create("div", "personal-data-value", personalData, normalizeCost(project_price) + ' ₽');
						var buttons = Create('div', 'buttons-order-window', body);
						var addWork = Create('get', null, buttons, 'Выбрать дополнительные услуги');
						var confirm = Create('get', null, buttons, 'Подтвердить заказ');
						confirm.onclick = function() {
							GetRequest(`/scripts/setOrder.php?id=${project_id} & brigade_id=${brigade_id}`, function(data) {
								if (data['status'] == 'ok'){
								closeUmodal();
								$(showUsersData).click();
							}
							notification('Информация', data['msg']);
							});
						}
						addWork.onclick = function() {
							showAddworksForClient(additionalworks, project_id, project_price, project_name, total_price, brigade_id);
							closeUmodal();
						}	
					}

					noButt.onclick = function() {
						closeUmodal();
					}
				}
				else
				{
					uModal("Подтверждение заказа", true, false, true, false);
					var body = umodal.ubody;
					Create("div", "personal-data-enter", body, 'Для завершения оформления Вашего заказа ознакомьтесь с информацией и нажмите на кнопку "Подтвердить заказ" :');
					var personalData = Create("div", "personal-data", body);
					var tot_cost = Create('div', 'personal-data-total', body);
					Create("div", "personal-data-key-total", tot_cost, 'Итоговая стоимость');
					Create("div", "personal-data-value-total", tot_cost, normalizeCost(project_price) + ' ₽');
					var personalData = Create("div", "personal-data", body);
					Create("div", "personal-data-key", personalData, 'Наименование проекта дома');
					Create("div", "personal-data-value", personalData, project_name);
					Create("div", "personal-data-key", personalData, 'Стоимость проекта дома');
					Create("div", "personal-data-value", personalData, normalizeCost(project_price) + ' ₽');
					var buttons = Create('div', 'buttons-order-window', body);
					var addWork = Create('get', null, buttons, 'Выбрать дополнительные услуги');
					var confirm = Create('get', null, buttons, 'Подтвердить заказ');
					confirm.onclick = function() {
						GetRequest(`/scripts/setOrder.php?id=${project_id} & brigade_id=${brigade_id}`, function(data) {
							if (data['status'] == 'ok'){
								closeUmodal();
								$(showUsersData).click();
							}
							notification('Информация', data['msg']);
						});
					}
					addWork.onclick = function() {
						showAddworksForClient(additionalworks, project_id, project_price, project_name, total_price, brigade_id);
						closeUmodal();
					}	
				}
			});
		}
	});
}

//UMODAL FUNCTIONS
// loginWindow
function loginWindow() {
	uModal("Авторизация", true, false, true);

	var inputs = [
		{ 'type': 'text', 'name': 'Login', 'placeholder': 'Логин', 'required': 1},
		{ 'type': 'password', 'name': 'Password', 'placeholder': 'Пароль', 'required': 1}
	];
	
	var ubody = umodal.ubody;
	var form = Create("form", null, ubody);
	form.setAttribute('method', 'post');
	form.setAttribute('action', '/scripts/login.php');
	form.setAttribute('id', '_form');
	
	for (var i in inputs) {
		var inputInfo = Create("div", "log-info", form);
		var input = Create('input', null, inputInfo);
		var attributes = inputs[i];

		for (var a in attributes) {
			input.setAttribute(a, attributes[a]);
		}
	}

	var buttons = Create('div', 'buttons', form);
	var submit = Create('input', null, buttons);
	submit.setAttribute('type', 'submit');
	submit.setAttribute('value', 'Войти');
	var ref = Create('ref', null, buttons, 'Зарегистрироваться');
	ref.onclick = regWindow;

	formHandler('/scripts/login.php', function (data) {
		if (data['status'] == 'ok'){
			notification('Авторизация', data['msg']);
			closeUmodal();

			uModal("Успешный вход систему", true, false, false, false);
			var body = umodal.ubody;
			Create("div", "personal-data-enter", body, `Здравствуйте, ${data['user_name']}, вы успешно вошли в систему!`);
			var buttons = Create('div', 'buttons', body);
			var enter = Create('supp_button', null, buttons, 'Продолжить');

			if (data['is_admin']) {
				enter.onclick = function() {
					window.location.replace('http://s96458su.beget.tech/adminboard.html');
					closeUmodal();
				}
			}
			else {
				enter.onclick = () => {
					window.location.reload();
				}
			}
		}
		else {
			notification_error('Авторизация', data['msg']);
			var wrongInput = umodal.querySelectorAll(`input[name="${data['name']}"]`)[0];
			setTimeout(() => wrongInput.classList.remove('deny'), 3000);
			wrongInput.classList.add('deny');
		}
	});
}

// registrationWindow
function regWindow() {
	uModal("Регистрация", true, false, true);

	var inputs = [
		{ 'type': 'text', 'name': 'Surname', 'placeholder': 'Фамилия', 'required': 1},
		{ 'type': 'text', 'name': 'Name', 'placeholder': 'Имя', 'required': 1},
		{ 'type': 'text', 'name': 'Second_Name', 'placeholder': 'Отчество', 'required': 1},
		{ 'type': 'number', 'name': 'Passport_Number', 'placeholder': 'Номер паспорта', 'required': 1},
		{ 'type': 'number', 'name': 'Passport_Series', 'placeholder': 'Серия паспорта', 'required': 1},
		{ 'type': 'tel', 'name': 'Phone_Number', 'placeholder': 'Номер телефона', 'required': 1},
		{ 'type': 'email', 'name': 'Mail', 'placeholder': 'Электронная почта', 'required': 1},
		{ 'type': 'text', 'name': 'Login', 'placeholder': 'Логин', 'required': 1},
		{ 'type': 'password', 'name': 'Password', 'placeholder': 'Пароль', 'required': 1}
	];

	var ubody = umodal.ubody;
	var form = Create("form", null, ubody);
	form.setAttribute('method', 'post');
	form.setAttribute('action', '/scripts/reg.php');
	form.setAttribute('id', '_form');

	for (var i in inputs) {
		var inputInfo = Create("div", "log-info", form);
		var input = Create('input', null, inputInfo);
		var attributes = inputs[i];

		for (var a in attributes) {
			input.setAttribute(a, attributes[a]);
		}
	}

	var submit = Create('input', null, form);
	submit.setAttribute('type', 'submit');
	submit.setAttribute('value', 'Зарегистрироваться');

	phoneInputValidate();

	formHandler('/scripts/reg.php', function(data){
		console.log(data);
		if (data['status'] == 'ok'){
			notification('Регистрация', data['msg']);
			closeUmodal();
		}
		else {
			notification('Регистрация', data['msg']);
			var wrongInput = umodal.querySelectorAll(`input[name="${data['name']}"]`)[0];
			setTimeout(() => wrongInput.classList.remove('deny'), 3000);
			wrongInput.classList.add('deny');
		}
	});
}

//AddNewProjectWindow
function addNewProjectWindow() {
	uModal("Новый проект", true, false, true);

	var inputs = 
	[{'title': 'Название', 'attributes': { 'name': 'Project_Name', 'type': 'text', 'required': '1'} },
	{'title': 'Метраж', 'attributes': { 'name': 'House_Size', 'type': 'number', 'step': 1, 'required': '1'} },
	{'title': 'Название основания', 'attributes': { 'name': 'House_Foundation_Material', 'type': 'text', 'required': '1'} },
	{'title': 'Название отделки', 'attributes': { 'name': 'House_Cover_Material', 'type': 'text', 'required': '1'} },
	{'title': 'Название крыши', 'attributes': { 'name': 'House_Roof_Material', 'type': 'text', 'required': '1'} },
	{'title': 'Цена', 'attributes': { 'name': 'Project_Price', 'type': 'number', 'step': 1, 'required': '1'} },
	{'title': 'Время строительства', 'attributes': { 'name': 'Time_Of_Building', 'type': 'number', 'step': 1, 'required': '1'} }];

	var ubody = umodal.ubody;

	var form = Create("form", null, ubody);
	form.setAttribute("method", "post");
	form.setAttribute("action", "/scripts/addProject.php");
	form.setAttribute('id', '_form');

	for (var i in inputs) {
		var inputInfo = Create("div", "input-info", form, inputs[i]['title']);
		var input = Create("input", null, inputInfo);

		var attributes = inputs[i]['attributes'];

		for (var a in attributes) {
			input.setAttribute(a, attributes[a]);
		}
	}

	var inputInfo = Create("div", "input-info", form, "Фотография");
	var label = Create("label", "input-file", inputInfo);
	var input = Create("input", null, label);
	input.setAttribute('required', '1');
	input.setAttribute('type', 'file');
	input.setAttribute('name', 'file');
	input.setAttribute('accept', 'image/png, image/jpeg');
	input.setAttribute('id', 'js-file');

	Create("span", "input-file-btn", label, "Выберите файл");
	Create("span", "input-file-text", label, "Здесь будет выведено название файла");

	var submitButton = Create("input", null, form);
	submitButton.setAttribute("type", "submit");
	submitButton.setAttribute("value", "Добавить");

	configureFileInput();

	formHandler('/scripts/addProject.php', function(data){
		if (data['status'] == 'ok'){
			closeUmodal();
			$(activeNavLink).click();
		}
notification('Информация', data['msg']);
	});
}

//AddNewAddworkWindow
function addNewAddworkWindow() {
	uModal("Новая услуга", true, false, true);

	var inputs = 
	[{ 'title': 'Наименование услуги', 'attributes': { 'name': 'Work_Name', 'type': 'text', 'required': '1'} },
	{ 'title': 'Стоимость работы', 'attributes': { 'name': 'Work_Price', 'type': 'number', 'step': 1, 'required': '1'} },
	{ 'title': 'Тип используемого материала', 'attributes': { 'name': 'Material_Name', 'type': 'text', 'required': '1'} },
	{ 'title': 'Стоимость единицы используемого материала', 'attributes': { 'name': 'Price_Of_One', 'type': 'number', 'step': 1, 'required': '1'} }];

	var body = umodal.ubody;

	var form = Create("form", null, body);
	form.setAttribute("method", "post");
	form.setAttribute("action", "/scripts/addAddwork.php");
	form.setAttribute('id', '_form');

	for (var i in inputs) {
		var inputInfo = Create("div", "input-info", form, inputs[i]['title']);
		var input = Create("input", null, inputInfo);

		var attributes = inputs[i]['attributes'];

		for (var a in attributes) {
			input.setAttribute(a, attributes[a]);
		}
	}

	var submitButton = Create("input", null, form);
	submitButton.setAttribute("type", "submit");
	submitButton.setAttribute("value", "Добавить");

	formHandler("/scripts/addAddwork.php", function(data){
		if (data['status'] == 'ok'){
			$(activeNavLink).click();
			closeUmodal();
		}
		notification('Информация', data['msg']);
	});
}

// AddNewBrigadeWindow
function addNewBrigadeWindow() {
	uModal("Новая бригада", true, false, true);

	var inputs = 
	[{ 'title': 'Номер бригады', 'attributes': { 'name': 'Brigade_Id', 'type': 'number', 'step': 1, 'required': '1'} },
	{ 'title': 'Фамилия бригадира', 'attributes': { 'name': 'B_Surname', 'type': 'text', 'required': '1'} },
	{ 'title': 'Имя бригадира', 'attributes': { 'name': 'B_Name', 'type': 'text', 'required': '1'} },
	{ 'title': 'Отчество бригадира', 'attributes': { 'name': 'B_Second_Name', 'type': 'text', 'required': '1'} },
	{ 'title': 'Контактный номер бригадира', 'attributes': { 'name': 'B_Phone_Number', 'type': 'tel', 'required': '1'} },
	{ 'title': 'Фамилия маляра', 'attributes': { 'name': 'M_Surname', 'type': 'text', 'required': '1'} },
	{ 'title': 'Имя маляра', 'attributes': { 'name': 'M_Name', 'type': 'text', 'required': '1'} },
	{ 'title': 'Отчество маляра', 'attributes': { 'name': 'M_Second_Name', 'type': 'text', 'required': '1'} },
	{ 'title': 'Контактный номер маляра', 'attributes': { 'name': 'M_Phone_Number', 'type': 'tel', 'required': '1'} },
	{ 'title': 'Фамилия плотника', 'attributes': { 'name': 'P_Surname', 'type': 'text', 'required': '1'} },
	{ 'title': 'Имя плотника', 'attributes': { 'name': 'P_Name', 'type': 'text', 'required': '1'} },
	{ 'title': 'Отчество плотника', 'attributes': { 'name': 'P_Second_Name', 'type': 'text', 'required': '1'} },
	{ 'title': 'Контактный номер плотника', 'attributes': { 'name': 'P_Phone_Number', 'type': 'tel', 'required': '1'} }];

	var body = umodal.ubody;
	var form = Create("form", null, body);
	form.setAttribute("method", "post");
	form.setAttribute("action", "/scripts/addBrigade.php");
	form.setAttribute('id', '_form');

	for (var i in inputs) {
		var inputInfo = Create("div", "input-info", form, inputs[i]['title']);
		var input = Create("input", null, inputInfo);

		var attributes = inputs[i]['attributes'];

		for (var a in attributes) {
			input.setAttribute(a, attributes[a]);
		}
	}

	var submitButton = Create("input", null, form);
	submitButton.setAttribute("type", "submit");
	submitButton.setAttribute("value", "Добавить");

	phoneInputValidate();

	formHandler("/scripts/addBrigade.php", function(data){
		if (data['status'] == 'ok'){
			$(activeNavLink).click();
			closeUmodal();
		}
	notification('Информация', data['msg']);
	});
}

// ClientInfoWindow
function clientInfoWindow(client_id) {
	GetRequest(`scripts/getClientInfo.php?id=${client_id}`, function(data) {
			uModal("Информация о клиенте", true, false, true, false);

			var rows = [
				{"title": "Фамилия клиента", "value": data['Surname']},
				{"title": "Имя клиента", "value": data['Name']},
				{"title": "Отчество клиента", "value": data['Second_Name']},
				{"title": "Номер паспорта", "value": data['Passport_Number']},
				{"title": "Серия паспорта", "value": data['Passport_Series']},
				{"title": "Контактный телефон клиента", "value": data['Phone_Number']},
				{"title": "Электронная почта клиента", "value": data['Mail']}
			];

			var body = umodal.ubody;

			for (var r in rows) {
				var row = rows[r];
				var personalData = Create("div", "personal-data", body);
				Create("div", "personal-data-key", personalData, row['title']);
				Create("div", "personal-data-value", personalData, row['value']);
			}
		});
}

// OrderInfoWindow
function orderInfoWindow(order_id) {
	GetRequest(`scripts/getOrderInfo.php?id=${order_id}`, function(data) {
		uModal("Информация о заказе", true, false, true, false);
		var rows = [
			{"title": "Номер заказа", "value": data['Order_Id']},
			{"title": "Ф.И.О. клиента", "value": data['FIO']},
			{"title": "Наименование проекта дома", "value": data['Project_Name']},
			{"title": "Номер назначенной бригады", "value": data['Brigade_Id']},
			{"title": "Дата начала выполнения заказа", "value": normalizeDate(data['Date_Of_Start'])},
			{"title": "Дата окончания выполнения заказа", "value": normalizeDate(data['Date_Of_End'])},
			{"title": "Стоимость проекта дома", "value": normalizeCost(data['Project_Price']) + ' ₽'}
			];

		var body = umodal.ubody;

		for (var r in rows) {
			var row = rows[r];
			var personalData = Create("div", "personal-data", body);
			Create("div", "personal-data-key", personalData, row['title']);
			Create("div", "personal-data-value", personalData, row['value']);
		}

		if (data['Additional_Works'].length != 0) {
			var additionalWorks = Create('div', 'personal-data', body);
			Create('div', 'personal-data-key', additionalWorks, 'Дополнительные услуги');

			for(var i in data['Additional_Works'])
			{
				var addWorkInfo = `${data['Additional_Works'][i]['Work_Name']} x${data['Additional_Works'][i]['Type_Of_Work_Amount']} (${normalizeCost(data['Additional_Works'][i]['AddWork_Price'])} ₽)`;
				Create('div', 'personal-data-value', additionalWorks, addWorkInfo);
			}
		}
		
		var personalData = Create("div", "personal-data", body);
		Create("div", "personal-data-key", personalData, 'Итоговая стоимость');
		Create("div", "personal-data-value", personalData, normalizeCost(data['Order_Price'])+ ' ₽');

		var buttons = Create('div', 'buttons-onload', body);
		var contract = Create('download', null, buttons, 'Загрузить договор');
		var act = Create('download', null, buttons, 'Загрузить акт приемки');

		contract.onclick = function() {
			window.location.href = `http://s96458su.beget.tech/scripts/contract.php?id=${order_id}`;
		}

		act.onclick = function() {
			GetRequest(`scripts/currentDate.php?id=${order_id}`, function(data) {
				if (data['status'] == 'error'){
					notification('Информация', data['msg']);
				}
				else {
					window.location.href = `http://s96458su.beget.tech/scripts/renting_act.php?id=${order_id}`;
				}
			});
		}

		if (session['user_id'] == -1)
		{
			var payment = Create('download', null, buttons, 'Загрузить платежную ведомость');

			payment.onclick = function() {
				GetRequest(`scripts/currentDate.php?id=${order_id}`, function(data) {
					if (data['status'] == 'error') {
						notification('Информация', data['msg']);
					}
					else {
						window.location.href = `http://s96458su.beget.tech/scripts/payment.php?id=${order_id}`;
					}
				});
			}
		}
	});
}

// BrigadesInfoWindow
function brigadeInfoWindow(brigade_id) {
	GetRequest(`scripts/getBrigadeInfo.php?id=${brigade_id}`, function(data) {
		uModal("Информация о бригаде", true, false, true, false);
		var inputs = 
		[{'title': 'Фамилия бригадира', 'attributes': { 'name': 'B_Surname', 'type': 'text', 'required': '1', 'value': data[0]['Surname']} },
		{'title': 'Имя бригадира', 'attributes': { 'name': 'B_Name', 'type': 'text', 'required': '1', 'value': data[0]['Name']} },
		{'title': 'Отчество бригадира', 'attributes': { 'name': 'B_Second_Name', 'type': 'text', 'required': '1', 'value': data[0]['Second_Name']} },
		{'title': 'Контактный телефон бригадира', 'attributes': { 'name': 'B_Phone_Number', 'type': 'tel', 'required': '1', 'value': data[0]['Phone_Number']} },
		{'title': 'Фамилия маляра', 'attributes': { 'name': 'M_Surname', 'type': 'text', 'required': '1', 'value': data[1]['Surname']} },
		{'title': 'Имя маляра', 'attributes': { 'name': 'M_Name', 'type': 'text', 'required': '1', 'value': data[1]['Name']} },
		{'title': 'Отчество маляра', 'attributes': { 'name': 'M_Second_Name', 'type': 'text', 'required': '1', 'value': data[1]['Second_Name']} },
		{'title': 'Контактный телефон маляра', 'attributes': { 'name': 'M_Phone_Number', 'type': 'tel', 'required': '1', 'value': data[1]['Phone_Number']} },
		{'title': 'Фамилия плотника', 'attributes': { 'name': 'P_Surname', 'type': 'text', 'required': '1', 'value': data[2]['Surname']} },
		{'title': 'Имя плотника', 'attributes': { 'name': 'P_Name', 'type': 'text', 'required': '1', 'value': data[2]['Name']} },
		{'title': 'Отчество плотника', 'attributes': { 'name': 'P_Second_Name', 'type': 'text', 'required': '1', 'value': data[2]['Second_Name']} },
		{'title': 'Контактный телефон плотника', 'attributes': { 'name': 'P_Phone_Number', 'type': 'tel', 'required': '1', 'value': data[2]['Phone_Number']} }];
		
		var ubody = umodal.ubody;
	
		var form = Create('form', null, ubody);
		form.setAttribute('method', 'post');
		form.setAttribute("action", "/scripts/editBrigade.php");
		form.setAttribute('id', '_form');
	
		var idInput = Create('input', null, form);
		idInput.setAttribute('style', 'display: none');
		idInput.setAttribute('readonly', 1);
		idInput.setAttribute('name', 'id');
		idInput.setAttribute('value', brigade_id);
	
		for (var i in inputs) {
			var inputInfo = Create("div", "input-info", form, inputs[i]['title']);
			var input = Create("input", null, inputInfo);
		
			var attributes = inputs[i]['attributes'];
		
			for (var a in attributes) {
				input.setAttribute(a, attributes[a]);
			}
		}

		var submitButton = Create("input", null, form);
		submitButton.setAttribute("type", "submit");
		submitButton.setAttribute("value", "Сохранить изменения");

		phoneInputValidate();

		formHandler("/scripts/editBrigade.php", function(data){
			if (data['status'] == 'ok'){
				closeUmodal();
				$(showBrigades).click();
			}
			 notification('Информация', data['msg']);
		});
	});
}

// AddworkInfoWindow
function addworkInfoWindow(addwork_id) {
	GetRequest(`scripts/getAddworkInfo.php?id=${addwork_id}`, function(data) {
		uModal("Информация о дополнительной услуге", true, false, true, false);

		var inputs = 
		[{'title': 'Наименование услуги', 'attributes': { 'name': 'Work_Name', 'type': 'text', 'required': '1', 'value': data['Work_Name']} },
		{'title': 'Стоимость работы', 'attributes': { 'name': 'Work_Price', 'type': 'number', 'step': 1, 'required': '1', 'value': data['Work_Price']} },
		{'title': 'Тип используемого материала', 'attributes': { 'name': 'Material_Name', 'type': 'text', 'required': '1', 'value': data['Material_Name']} },
		{'title': 'Стоимость единицы используемого материала', 'attributes': { 'name': 'Price_Of_One', 'type': 'number', 'step': 1, 'required': '1', 'value': data['Price_Of_One']} }];
		
		var ubody = umodal.ubody;
	
		var form = Create('form', null, ubody);
		form.setAttribute('method', 'post');
		form.setAttribute("action", "/scripts/editAddwork.php");
		form.setAttribute('id', '_form');
	
		var idInput = Create('input', null, form);
		idInput.setAttribute('style', 'display: none');
		idInput.setAttribute('readonly', 1);
		idInput.setAttribute('name', 'id');
		idInput.setAttribute('value', addwork_id);
	
		for (var i in inputs) {
			var inputInfo = Create("div", "input-info", form, inputs[i]['title']);
			var input = Create("input", null, inputInfo);
		
			var attributes = inputs[i]['attributes'];
		
			for (var a in attributes) {
				input.setAttribute(a, attributes[a]);
			}
		}

		var submitButton = Create("input", null, form);
		submitButton.setAttribute("type", "submit");
		submitButton.setAttribute("value", "Сохранить изменения");

		formHandler("/scripts/editAddwork.php", function(data){
			if (data['status'] == 'ok'){
				closeUmodal();
				$(showAddWorks).click();
			}
			 notification('Информация', data['msg']);
		});
	});
}

// EditProjectInfoWindow
function editProjectInfoWindow(project_id) {
	GetRequest(`/scripts/getProject.php?id=${project_id}`, function(data) {

		uModal("Информация о проекте", true, false, true);

		var inputs = 
		[{'title': 'Название', 'attributes': { 'name': 'Project_Name', 'type': 'text', 'required': '1', 'value': data['Project_Name']} },
		{'title': 'Метраж', 'attributes': { 'name': 'House_Size', 'type': 'number', 'step': 1, 'required': '1', 'value': data['House_Size']} },
		{'title': 'Название основания', 'attributes': { 'name': 'House_Foundation_Material', 'type': 'text', 'required': '1', 'value': data['House_Foundation_Material']} },
		{'title': 'Название отделки', 'attributes': { 'name': 'House_Cover_Material', 'type': 'text', 'required': '1', 'value': data['House_Cover_Material']} },
		{'title': 'Название крыши', 'attributes': { 'name': 'House_Roof_Material', 'type': 'text', 'required': '1', 'value': data['House_Roof_Material']} },
		{'title': 'Цена', 'attributes': { 'name': 'Project_Price', 'type': 'number', 'step': 1, 'required': '1', 'value': data['Project_Price']} },
		{'title': 'Время строительства', 'attributes': { 'name': 'Time_Of_Building', 'type': 'number', 'step': 1, 'required': '1', 'value': data['Time_Of_Building']} }];
	
		var ubody = umodal.ubody;

		var form = Create('form', null, ubody);
		form.setAttribute('method', 'post');
		form.setAttribute("action", "/scripts/editProject.php");
		form.setAttribute('id', '_form');

		var idInput = Create('input', null, form);
		idInput.setAttribute('style', 'display: none');
		idInput.setAttribute('readonly', 1);
		idInput.setAttribute('name', 'id');
		idInput.setAttribute('value', project_id);

		for (var i in inputs) {
			var inputInfo = Create("div", "input-info", form, inputs[i]['title']);
			var input = Create("input", null, inputInfo);
	
			var attributes = inputs[i]['attributes'];
	
			for (var a in attributes) {
				input.setAttribute(a, attributes[a]);
			}
		}
	
		var inputInfo = Create("div", "input-info", form, "Фотография");
		var label = Create("label", "input-file", inputInfo);
		var input = Create("input", null, label);
		input.setAttribute('type', 'file');
		input.setAttribute('name', 'file');
		input.setAttribute('accept', 'image/png, image/jpeg');
		input.setAttribute('id', 'js-file');
	
		Create("span", "input-file-btn", label, "Выберите файл");
		Create("span", "input-file-text", label, data['Img']);
	
		var imgName = Create('input', null, form);
		imgName.setAttribute('name', 'img');
		imgName.setAttribute('value', data['Img']);
		imgName.setAttribute('hidden', 1);
	
		configureFileInput();

		var submitButton = Create("input", null, form);
		submitButton.setAttribute("type", "submit");
		submitButton.setAttribute("value", "Сохранить изменения");

		formHandler("/scripts/editProject.php", function(data){
			if (data['status'] == 'ok'){
				$(activeNavLink).click();
				closeUmodal();
			}
		notification('Информация', data['msg']);
		});
	});
}

//editUserInfo
function editUserData() {
	GetRequest(`/scripts/getUser.php?id=${session['user_id']}`, function(data) {
		uModal("Личные данные", true, false, true);
	
		var inputs = 
		[{'title': 'Фамилия', 'attributes': { 'name': 'Surname', 'type': 'text', 'required': '1', 'value': data['Surname']} },
		{'title': 'Имя', 'attributes': { 'name': 'Name', 'type': 'text', 'required': '1', 'value': data['Name']} },
		{'title': 'Отчество', 'attributes': { 'name': 'Second_Name', 'type': 'text', 'required': '1', 'value': data['Second_Name']} },
		{'title': 'Номер паспорта', 'attributes': { 'name': 'Passport_Number', 'type': 'number', 'step': 1, 'required': '1', 'value': data['Passport_Number']} },
		{'title': 'Серия паспорта', 'attributes': { 'name': 'Passport_Series', 'type': 'number', 'step': 1, 'required': '1', 'value': data['Passport_Series']} },
		{'title': 'Номер телефона', 'attributes': { 'name': 'Phone_Number', 'type': 'tel', 'required': '1', 'value': data['Phone_Number']} },
		{'title': 'Электронная почта', 'attributes': { 'name': 'Mail', 'type': 'mail', 'required': '1', 'value': data['Mail']} },
		{'title': 'Логин', 'attributes': { 'name': 'Login', 'type': 'text', 'required': '1', 'value': data['Login']} },
		{'title': 'Пароль', 'attributes': { 'name': 'Password', 'type': 'password', 'required': '1', 'value': data['Password']} }];
		
		var ubody = umodal.ubody;
	
		var form = Create('form', null, ubody);
		form.setAttribute('method', 'post');
		form.setAttribute("action", "/scripts/editUser.php");
		form.setAttribute('id', '_form');
	
		var idInput = Create('input', null, form);
		idInput.setAttribute('style', 'display: none');
		idInput.setAttribute('readonly', 1);
		idInput.setAttribute('name', 'id');
		idInput.setAttribute('value', session['user_id']);
	
		for (var i in inputs) {
			var inputInfo = Create("div", "input-info", form, inputs[i]['title']);
			var input = Create("input", null, inputInfo);
		
			var attributes = inputs[i]['attributes'];
		
			for (var a in attributes) {
				input.setAttribute(a, attributes[a]);
			}
		}

		var submitButton = Create("input", null, form);
		submitButton.setAttribute("type", "submit");
		submitButton.setAttribute("value", "Сохранить изменения");

		phoneInputValidate();

		formHandler("/scripts/editUser.php", function(data){
			if (data['status'] == 'ok'){
				closeUmodal();
				$(showUsersData).click();
			}
			notification('Информация', data['msg']);
		});
	});
}

function addworkForClientInfoWindow(addwork_id, additionalworks) {
	GetRequest(`scripts/getAddworkInfo.php?id=${addwork_id}`, function(data) {
		uModal("Добавить дополнительную улугу", true, false, true, false);
		var rows = [
			{"title": "Наименование услуги", "value": data['Work_Name']},
			{"title": "Стоимость работы", "value": normalizeCost(data['Work_Price']) + ' ₽'},
			{"title": "Тип используемого материала", "value": data['Material_Name']},
			{"title": "Стоимость единицы используемого материала", "value": normalizeCost(data['Price_Of_One']) + ' ₽'},
			];

		var body = umodal.ubody;

		for (var r in rows) {
			var row = rows[r];
			var personalData = Create("div", "personal-data", body);
			Create("div", "personal-data-key", personalData, row['title']);
			Create("div", "personal-data-value", personalData, row['value']);
		}

		var inputs = 
		[{'title': 'Количество', 'attributes': { 'name': 'Type_Of_Work_Amount', 'type': 'number', 'step': 1}}];
		
		for (var i in inputs) {
			var inputInfo = Create("div", "input-info", body, inputs[i]['title']);
			var input = Create("input", null, inputInfo);
		
			var attributes = inputs[i]['attributes'];
		
			for (var a in attributes) {
				input.setAttribute(a, attributes[a]);
			}
		}

		var buttons = Create('div', 'buttons', body);
		var add = Create('supp_button', null, buttons, 'Добавить услугу');
		add.onclick = function() {
			var new_type = document.getElementsByName('Type_Of_Work_Amount')[0].value;
			var amount = parseInt(new_type);
			if (new_type !== "") {
				var total_additionalworks_price = (data['Work_Price']*amount) + (data['Price_Of_One']*amount);
				var new_addwork = {
			 		Work_Id: parseInt(addwork_id),
			  		Type_Of_Work_Amount: amount,
			  		Material_Name: data['Material_Name'],
			 		Total_Addworks: total_additionalworks_price,
			  		Work_Name: data['Work_Name']
				};
				var found = false;
				for (var i = 0; i < additionalworks.length; i++) {
				if (additionalworks[i]['Work_Id'] == new_addwork['Work_Id']) {
					additionalworks[i]['Type_Of_Work_Amount'] = new_addwork['Type_Of_Work_Amount'];
					additionalworks[i]['Total_Addworks'] = new_addwork['Total_Addworks']
					found = true;
					break;
				}
				}
				if (!found) {
					additionalworks.push(new_addwork);
				}
				closeUmodal();
			}
			else {
				alert('Пожалуйста, заполните поле "Количество"');
			}
		};
	});
}