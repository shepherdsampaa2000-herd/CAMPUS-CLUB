const API = 'http://localhost:3000/api/clubs';

const form = document.getElementById('clubForm');
const table = document.getElementById('clubsTable');
const message = document.getElementById('message');
const saveButton = document.getElementById('saveButton');
const cancelButton = document.getElementById('cancelButton');
const formTitle = document.getElementById('formTitle');

async function loadClubs() {
    table.innerHTML = '<tr><td colspan="10">Loading clubs...</td></tr>';

    try {
        const response = await fetch(API);
        if (!response.ok) throw new Error('Could not load clubs');

        const clubs = await response.json();
        table.innerHTML = '';

        if (clubs.length === 0) {
            table.innerHTML =
                '<tr><td colspan="10">No clubs found.</td></tr>';
            return;
        }

        clubs.forEach(club => {
            const row = document.createElement('tr');

            [
                club.id,
                club.name,
                club.description,
                club.category,
                club.location || '',
                club.meeting_day || '',
                club.membership_count ?? 0,
                club.created_at || '',
                club.updated_at || ''
            ].forEach(value => {
                const cell = document.createElement('td');
                cell.textContent = value ?? '';
                row.appendChild(cell);
            });

            const actions = document.createElement('td');

            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.className = 'edit-button';
            editButton.addEventListener('click', () => editClub(club));

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.className = 'delete-button';
            deleteButton.addEventListener('click', () => deleteClub(club.id));

            actions.append(editButton, deleteButton);
            row.appendChild(actions);
            table.appendChild(row);
        });

    } catch (error) {
        table.innerHTML =
            '<tr><td colspan="10">Unable to load clubs.</td></tr>';
        showMessage(error.message, true);
    }
}

function showMessage(text, isError = false) {
    message.textContent = text;
    message.style.color = isError ? '#c0392b' : '#18794e';
}

form.addEventListener('submit', async event => {
    event.preventDefault();

    const id = document.getElementById('clubId').value;

    const club = {
        name: document.getElementById('name').value.trim(),
        description: document.getElementById('description').value.trim(),
        category: document.getElementById('category').value.trim(),
        location: document.getElementById('location').value.trim(),
        meeting_day: document.getElementById('meeting_day').value,
        membership_count: Number(
            document.getElementById('membership_count').value
        )
    };

    try {
        const response = await fetch(id ? `${API}/${id}` : API, {
            method: id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(club)
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Could not save club');
        }

        showMessage(id ? 'Club updated successfully!' : 'Club added successfully!');
        resetForm();
        await loadClubs();

    } catch (error) {
        showMessage(error.message, true);
    }
});

function editClub(club) {
    document.getElementById('clubId').value = club.id;
    document.getElementById('name').value = club.name;
    document.getElementById('description').value = club.description;
    document.getElementById('category').value = club.category;
    document.getElementById('location').value = club.location || '';
    document.getElementById('meeting_day').value = club.meeting_day || '';
    document.getElementById('membership_count').value =
        club.membership_count ?? 0;

    formTitle.textContent = 'Edit Club';
    saveButton.textContent = 'Update Club';
    cancelButton.hidden = false;
    form.scrollIntoView({ behavior: 'smooth' });
}

async function deleteClub(id) {
    if (!confirm('Are you sure you want to delete this club?')) return;

    try {
        const response = await fetch(`${API}/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Could not delete club');
        }

        showMessage('Club deleted successfully!');
        await loadClubs();

    } catch (error) {
        showMessage(error.message, true);
    }
}

function resetForm() {
    form.reset();
    document.getElementById('clubId').value = '';
    formTitle.textContent = 'Add a New Club';
    saveButton.textContent = 'Add Club';
    cancelButton.hidden = true;
}

cancelButton.addEventListener('click', resetForm);

document.getElementById('refreshButton')
    .addEventListener('click', loadClubs);

window.addEventListener('load', loadClubs);