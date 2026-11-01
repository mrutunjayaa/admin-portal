    // --- VIEW: NOTES ---
    Router.register('notes', () => {
      const main = document.getElementById('main-content-view');
      const notes = DB.cache.Notes;

      main.innerHTML = `
        <div class="fade-in-up">
          <div class="grid-3">
            <div class="card">
              <div class="card-title"><i class="material-icons-round">folder</i>Notes Pad Folders</div>
              <button class="btn btn-primary" style="width:100%; margin-bottom:14px;" onclick="openAddNoteModal()"><i class="fas fa-plus"></i> New Note</button>
              <div style="display:flex; flex-direction:column; gap:8px;">
                ${notes.map(n => `
                  <div style="background:var(--bg-secondary); border:1px solid var(--border); padding:10px; border-radius:8px; cursor:pointer;" onclick="viewFullNote('${n.id}')">
                    <span style="font-weight:600; font-size:0.85rem; color:var(--gold-light);">${n.title}</span>
                    <div style="font-size:0.7rem; color:var(--text-muted); margin-top:4px;"><i class="fas fa-folder-open" style="margin-right:4px;"></i>${n.project || n.category || 'General'}</div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Notes Editor Panel -->
            <div class="card col-span-2">
              <div class="card-title"><i class="material-icons-round">edit</i>Rich Editor Pad</div>
              <div id="notes-viewer-area" style="padding:10px; min-height: 200px; display:flex; align-items:center; justify-content:center; color:var(--text-muted); font-style:italic;">
                Select a note card from folder directory to view and edit...
              </div>
            </div>
          </div>
        </div>
      `;
    });

    window.viewFullNote = function(id) {
      const note = DB.cache.Notes.find(n => n.id === id);
      if (note) {
        const labelOptions = window.buildProjectDropdownOptions(note.project || note.category, 'edit-n-project');

        document.getElementById('notes-viewer-area').innerHTML = `
          <div style="display:flex; flex-direction:column; gap:16px; width:100%;">
            <div class="form-group" style="margin-bottom:0;">
              <label>Note Title</label>
              <input type="text" class="form-control" id="edit-n-title" value="${note.title}">
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label>Project</label>
              ${labelOptions}
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label>Content</label>
              <div class="rte-toolbar" style="background:var(--bg-secondary); border:1px solid var(--border); border-bottom:none; border-radius:8px 8px 0 0; padding:8px; display:flex; gap:8px;">
                <button type="button" class="btn btn-secondary btn-sm" style="padding:4px 10px;" onclick="document.execCommand('bold',false,null)"><i class="fas fa-bold"></i></button>
                <button type="button" class="btn btn-secondary btn-sm" style="padding:4px 10px;" onclick="document.execCommand('italic',false,null)"><i class="fas fa-italic"></i></button>
                <button type="button" class="btn btn-secondary btn-sm" style="padding:4px 10px;" onclick="document.execCommand('underline',false,null)"><i class="fas fa-underline"></i></button>
                <button type="button" class="btn btn-secondary btn-sm" style="padding:4px 10px;" onclick="window.customPromptLink(url => { if(url) document.execCommand('createLink',false,url); })"><i class="fas fa-link"></i> Link</button>
                <label title="Text Color" class="btn btn-secondary btn-sm" style="padding:2px 6px; display:inline-flex; align-items:center; gap:4px; cursor:pointer; margin:0;">
                  <i class="fas fa-font"></i>
                  <input type="color" oninput="document.execCommand('foreColor', false, this.value)" style="width:20px; height:20px; padding:0; border:none; cursor:pointer; background:transparent;">
                </label>
                <label title="Background Color" class="btn btn-secondary btn-sm" style="padding:2px 6px; display:inline-flex; align-items:center; gap:4px; cursor:pointer; margin:0;">
                  <i class="fas fa-fill-drip"></i>
                  <input type="color" oninput="document.execCommand('hiliteColor', false, this.value)" style="width:20px; height:20px; padding:0; border:none; cursor:pointer; background:transparent;">
                </label>
              </div>
              <div id="edit-n-body" class="form-control rte-content" contenteditable="true" style="border-radius:0 0 8px 8px; min-height:280px; overflow-y:auto; background:var(--bg-tertiary); outline:none; font-size:0.95rem; line-height:1.6; padding:16px;">${note.content}</div>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
              <button class="btn btn-danger" onclick="deleteNote('${note.id}')"><i class="fas fa-trash"></i> Delete Note</button>
              <button class="btn btn-primary" onclick="updateNoteEntry('${note.id}')"><i class="fas fa-save"></i> Save Changes</button>
            </div>
          </div>
        `;
      }
    };

    window.updateNoteEntry = function(id) {
      const note = DB.cache.Notes.find(n => n.id === id);
      if (note) {
        note.title = document.getElementById('edit-n-title').value || 'Untitled note';
        note.project = document.getElementById('edit-n-project').value || '';
        note.category = note.project || 'General';
        const bodyEl = document.getElementById('edit-n-body');
        note.content = bodyEl ? bodyEl.innerHTML : '';
        note.updatedAt = new Date().toISOString();
        DB.saveTable('Notes').then(() => {
          showNotification("Note updated successfully!");
          Router.routes['notes']();
        });
      }
    };

    window.openAddNoteModal = function() {
      const labelOptions = window.buildProjectDropdownOptions('', 'n-project');

      const html = `
        <div class="form-group">
          <label>Note Title</label>
          <input type="text" class="form-control" id="n-title" placeholder="Note header">
        </div>
        <div class="form-group">
          <label>Select Project</label>
          ${labelOptions}
        </div>
        <div class="form-group">
          <label>Content</label>
          <div class="rte-toolbar" style="background:var(--bg-secondary); border:1px solid var(--border); border-bottom:none; border-radius:8px 8px 0 0; padding:8px; display:flex; gap:8px;">
            <button type="button" class="btn btn-secondary btn-sm" style="padding:4px 10px;" onclick="document.execCommand('bold',false,null)"><i class="fas fa-bold"></i></button>
            <button type="button" class="btn btn-secondary btn-sm" style="padding:4px 10px;" onclick="document.execCommand('italic',false,null)"><i class="fas fa-italic"></i></button>
            <button type="button" class="btn btn-secondary btn-sm" style="padding:4px 10px;" onclick="document.execCommand('underline',false,null)"><i class="fas fa-underline"></i></button>
            <button type="button" class="btn btn-secondary btn-sm" style="padding:4px 10px;" onclick="window.customPromptLink(url => { if(url) document.execCommand('createLink',false,url); })"><i class="fas fa-link"></i> Link</button>
            <label title="Text Color" class="btn btn-secondary btn-sm" style="padding:2px 6px; display:inline-flex; align-items:center; gap:4px; cursor:pointer; margin:0;">
              <i class="fas fa-font"></i>
              <input type="color" oninput="document.execCommand('foreColor', false, this.value)" style="width:20px; height:20px; padding:0; border:none; cursor:pointer; background:transparent;">
            </label>
            <label title="Background Color" class="btn btn-secondary btn-sm" style="padding:2px 6px; display:inline-flex; align-items:center; gap:4px; cursor:pointer; margin:0;">
              <i class="fas fa-fill-drip"></i>
              <input type="color" oninput="document.execCommand('hiliteColor', false, this.value)" style="width:20px; height:20px; padding:0; border:none; cursor:pointer; background:transparent;">
            </label>
          </div>
          <div id="n-body" class="form-control rte-content" contenteditable="true" style="border-radius:0 0 8px 8px; min-height:550px; overflow-y:auto; background:var(--bg-tertiary); outline:none; font-size:0.95rem; line-height:1.6; padding:12px;"></div>
        </div>
      `;
      showModal("Create New Note", html, "Save Note", saveNoteEntry);
      const modalContent = document.querySelector('.modal-content');
      if (modalContent) modalContent.style.maxWidth = '1000px';
    };

    window.saveNoteEntry = function() {
      const bodyEl = document.getElementById('n-body');
      const note = {
        id: DB.uid(),
        title: document.getElementById('n-title').value || 'Untitled note',
        project: document.getElementById('n-project').value || '',
        category: document.getElementById('n-project').value || 'General',
        content: bodyEl ? bodyEl.innerHTML : '',
        tags: '',
        updatedAt: new Date().toISOString()
      };

      DB.cache.Notes.push(note);
      DB.saveTable('Notes').then(() => {
        showNotification("New note added successfully!");
        Router.routes['notes']();
      });
    };

    window.deleteNote = function(id) {
      if (confirm("Delete this note permanently?")) {
        DB.cache.Notes = DB.cache.Notes.filter(n => n.id !== id);
        DB.saveTable('Notes').then(() => {
          showNotification("Note removed.");
          Router.routes['notes']();
        });
      }
    };
