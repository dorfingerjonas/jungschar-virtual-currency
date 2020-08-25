let entries = [];

window.addEventListener('load', () => {
	firebase.database().ref('entries/').on('value', snapshot => {
		entries = [];

		for (const key in snapshot.val()) {
			entries.push(snapshot.val()[key]);
		}

		for (let i = 0; i < entries.length; i++) {
			for (let j = i; j < entries.length; j++) {
				if (entries[i].name > entries[j].name) {
					const temp = entries[i];
					entries[i] = entries[j];
					entries[j] = temp;
				}
			}
		}

		if (entries.length !== 0) {
			printEntries(entries);
		}
	});

	handleButtons();
});

function printEntries(entries) {
	const parent = document.getElementById('entriesWrapper');

	while (parent.firstChild) parent.removeChild(parent.firstChild);

	for (const entry of entries) {
		const newEntry = document.createElement('div');
		const textWrapper = document.createElement('div');
		const name = document.createElement('h2');
		const subText = document.createElement('span');
		const qrCode = document.createElement('div');

		name.textContent = entry.name;
		subText.textContent = 'Spielestadt "Loga dahoam", 2020';

		new QRCode(qrCode, {
			width : 1024,
			height : 1024,
			text: `https://dorfingerjonas.at/jungschar-virtual-currency?name=${entry.name}`,
			correctLevel : QRCode.CorrectLevel.H
		});

		newEntry.group = entry.group;

		newEntry.addEventListener('click', () => {
			newEntry.classList.toggle('selected');
		});

		newEntry.classList.add('entry');

		entries[entries.indexOf(entry)].element = newEntry;

		textWrapper.appendChild(name);
		textWrapper.appendChild(subText);
		newEntry.appendChild(textWrapper);
		newEntry.appendChild(qrCode);
		parent.appendChild(newEntry);
	}
}

function handleButtons() {
	const selectAll = document.getElementById('selectAll');
	const clearSelection = document.getElementById('clearSelection');
	const selectCompanies = document.getElementById('selectCompanies');
	const selectRed = document.getElementById('selectRed');
	const selectBlue = document.getElementById('selectBlue');
	const print = document.getElementById('print');

	selectAll.addEventListener('click', () => {
		for (const entry of entries) {
			entry.element.classList.add('selected');
		}
	});

	clearSelection.addEventListener('click', () => {
		for (const entry of entries) {
			entry.element.classList.remove('selected');
		}
	});

	selectCompanies.addEventListener('click', () => {
		clearSelection.click();

		for (const entry of entries) {
			if (entry.group === 'company') {
				entry.element.classList.add('selected');
			}
		}
	});

	selectRed.addEventListener('click', () => {
		clearSelection.click();

		for (const entry of entries) {
			if (entry.group === 'red') {
				entry.element.classList.add('selected');
			}
		}
	});

	selectBlue.addEventListener('click', () => {
		clearSelection.click();
		
		for (const entry of entries) {
			if (entry.group === 'blue') {
				entry.element.classList.add('selected');
			}
		}
	});

	print.addEventListener('click', () => {

	});

}