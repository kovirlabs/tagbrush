# Forms

Fields are full width and spaced automatically. Use real labels; nothing needs a class.

- **Fields**: `<label for="email">Email</label><input type="email" id="email">`, or wrap the input in its label: `<label>Email <input type="email"></label>`. Every text-like input type, `<select>` and `<textarea>` gets the same look.
- **Help text**: a `<small>` directly after the field: `<input type="password" id="password"><small>At least 12 characters.</small>`.
- **Errors**: `aria-invalid="true"` on the field turns it and its `<small>` red. Native validation does the same once the user has interacted with the field (`:user-invalid`), never before.
- **Valid fields**: a field with a rule to meet (`required`, `pattern`, `minlength`, `min`, `max`, `type="email"` or `type="url"`) turns green once the user has met it. Fields without a rule stay neutral. `aria-invalid="false"` marks a field valid yourself.
- **Checkboxes and radios**: `<label><input type="checkbox"> Remember me</label>`.
- **Choice cards**: a radio or checkbox label with a `<small>` description is a card, outlined when chosen, and a fieldset of them lays them in a row: `<fieldset><legend>Plan</legend><label><input type="radio" name="plan" value="solo"> <strong>Solo</strong> <small>One person</small></label><label><input type="radio" name="plan" value="team"> <strong>Team</strong> <small>Up to 10 people</small></label></fieldset>`. Labels without a `<small>` stay plain.
- **Toggle switch**: `<label><input type="checkbox" role="switch"> Email me updates</label>`.
- **Select**: `<select>` gets an arrow in the theme's colors. With a mouse, browsers that support it open a picker in the theme's colors; touch screens keep the system's picker. `multiple` and `size` selects are lists.
- **Text areas**: a `<textarea>` without a `rows` attribute grows as the user types; with `rows` it keeps that height. `readonly` and `disabled` fields are styled.
- **Field groups**: `<fieldset><legend>Shipping address</legend>…</fieldset>` groups related fields under a title.
- **Form buttons**: `<button>` submits; `<button class="secondary" type="reset">` for a lesser action. A busy submit button: `aria-busy="true"`.
