const API = 'https://campus-club-3.onrender.com/api/clubs';

const form = document.getElementById('clubForm');
const table = document.getElementById('clubsTable');
const message = document.getElementById('message');
let editId = '';

async function loadClubs() {
    try {
        const res = await fetch(API);
        if (!res.ok) throw new Error('Failed to load clubs');

        const clubs = await res.json();
        table.innerHTML = '';

        if (!clubs.length) {
            table.innerHTML = '<tr><td colspan="10">No clubs found</td></tr>';
            return;
        }

        clubs.forEach(c => {
            const row = table.insertRow();

            [
                c.id, c.name, c.description, c.category,
                c.location, c.meeting_day, c.membership_count,
                c.created_at, c.updated_at
            ].forEach(value => {
                row.insertCell().textContent = value ?? '';
            });

            const cell = row.insertCell();

            cell.innerHTML = `
                <button class="edit-button">Edit</button>
                <button class="delete-button">Delete</button>`;

            cell.children[0].onclick = () => editClub(c);
            cell.children[1].onclick = () => deleteClub(c.id);
        });
    } catch (e) {
        message.textContent = e.message;
    }
}

function editClub(c) {
    editId = c.id;

    ['name', 'description', 'category', 'location',
     'meeting_day', 'membership_count'].forEach(key => {
        document.getElementById(key).value = c[key] ?? '';
    });

    document.getElementById('formTitle').textContent = 'Edit Club';
    document.getElementById('saveButton').textContent = 'Update Club';
    document.getElementById('cancelButton').hidden = false;
}

form.onsubmit = async e => {
    e.preventDefault();

    const club = {};
    ['name', 'description', 'category', 'location',
     'meeting_day', 'membership_count'].forEach(key => {
        club[key] = document.getElementById(key).value.trim();
    });

    club.membership_count = Number(club.membership_count);

    try {
        const res = await fetch(editId ? `${API}/${editId}` : API, {
            method: editId ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(club)
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.message || 'Save failed');

        message.textContent = 'Club saved successfully!';
        resetForm();
        loadClubs();
    } catch (e) {
        message.textContent = e.message;
    }
};

async function deleteClub(id) {
    if (!confirm('Delete this club?')) return;

    try {
        const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
        const result = await res.json();

        if (!res.ok) throw new Error(result.message || 'Delete failed');

        message.textContent = 'Club deleted successfully!';
        loadClubs();
    } catch (e) {
        message.textContent = e.message;
    }
}

function resetForm() {
    form.reset();
    editId = '';
    document.getElementById('formTitle').textContent = 'Add a New Club';
    document.getElementById('saveButton').textContent = 'Add Club';
    document.getElementById('cancelButton').hidden = true;
}

document.getElementById('cancelButton').onclick = resetForm;
document.getElementById('refreshButton').onclick = loadClubs;

loadClubs();