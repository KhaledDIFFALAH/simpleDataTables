# simpleDataTables

A lightweight and efficient JavaScript class for handling data tables with ease. `simpleDataTables` provides an intuitive and flexible way to display, search, and paginate tabular data without relying on external dependencies.

## Features

- **Lightweight**: Minimal footprint with no external dependencies.
- **Sorting**: Easily sort table columns.
- **Pagination**: Built-in pagination for large datasets.
- **Search & Filter**: Quickly find data with a built-in search box.
- **Customizable**: Easily configurable to fit your needs.
- **Responsive**: Works seamlessly across different screen sizes.
- **Multi-language Support**: Supports multiple languages with i18n.

## Installation

You can include `simpleDataTables` in your project via a CDN or by downloading it from the repository.

### Using CDN

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/KhaledDIFFALAH/simpleDataTables@latest/css/std.css">
<script src="https://cdn.jsdelivr.net/gh/KhaledDIFFALAH/simpleDataTables@latest/js/std.js"></script>
```

You can install simpleDataTables using Composer.

### Install via Composer
To install the library via Composer, run the following command:

```sh
composer require khaleddiffalah/simpledatatables
```
This will add the library as a dependency in your composer.json file.

You can install simpleDataTables using npm:
### Install via npm
To install the library via npm, run the following command:

```sh
npm install simpledatatables-js
```
This will add the library as a dependency in your package.json file.

### Install via git

Clone the repository and include the script in your project:

```sh
git clone https://github.com/KhaledDIFFALAH/simpleDataTables.git
```

### Manual Installation

If you prefer not to use CDN, npm or composer, you can download the simpleDataTables files directly from the GitHub repository and include it in your project.

## Usage

If you're using npm, you can import it into your project like so:

```javascript
import simpleDatatables from 'simpledatatables-js';
```

If you're using composer, git or the manual installation method, include the simpleDataTables files in your HTML:

```html
<link rel="stylesheet" href="path/to/css/std.css">
<script src="path/to/js/std.js"></script>
```

### Basic Example

```html
<table id="myTable">
    <thead>
        <tr>
            <th>Name</th>
            <th>Age</th>
            <th>Country</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>John Doe</td>
            <td>28</td>
            <td>USA</td>
        </tr>
        <tr>
            <td>Jane Smith</td>
            <td>34</td>
            <td>Canada</td>
        </tr>
    </tbody>
</table>

<script>
    document.addEventListener("DOMContentLoaded", function () {
        new SimpleDataTable("#myTable");
    });
</script>
```

## Configuration

`simpleDataTables` supports various configuration options:

```js
new SimpleDataTable("#myTable", {
    pagination: true,
    maxRowsPerPage: 10,
    dataSorting: true,
    dataSortingBy: null,
    dataSortingDirection: 'asc',
    excludedColumns: [],
    enableFilters: false,
    columnFilters: {},
    searchbar: true,
    prevBtn: "❮",
    nextBtn: "❯",
    dotsBtn: "•••",
    language: 'en', // Default language
    tableScrollable: true,
    tableMaxHeight: null
});
```

### Options

| Option               | Type    | Default | Description                         |
| -------------------- | ------- | ------- | ----------------------------------- |
| `pagination`        | Boolean | `true`  | Enables pagination                  |
| `maxRowsPerPage`    | Number  | `10`    | Maximum number of rows per page     |
| `dataSorting`       | Boolean | `true`  | Enables column sorting              |
| `dataSortingBy`     | String  | `null`  | Default sorting column              |
| `dataSortingDirection` | String | `'asc'` | Sorting direction (`asc` or `desc`) |
| `excludedColumns`   | Array   | `[]`    | Columns to exclude from sorting     |
| `enableFilters`     | Boolean | `false` | Enables column filters              |
| `columnFilters`     | Object  | `{}`    | Custom column filters               |
| `searchbar`        | Boolean | `true`  | Enables the search box              |
| `prevBtn`           | String  | `❮`     | Previous button text                |
| `nextBtn`           | String  | `❯`     | Next button text                    |
| `dotsBtn`           | String  | `•••`    | Dots button text                    |
| `language`         | String  | `'en'`  | Default language                    |
| `tableScrollable`  | Boolean | `true`  | Enables table scrolling             |
| `tableMaxHeight`   | Number  | `null`  | Sets max table height               |

## Language Support

`simpleDataTables` supports multiple languages and allows selecting the desired language using the `language` option. Additional languages can be added in the `i18n` configuration.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## Author

Developed by [Khaled DIFFALAH](https://github.com/KhaledDIFFALAH).

## Support

If you find this project useful, please consider giving it a ⭐ on [GitHub](https://github.com/KhaledDIFFALAH/simpleDataTables).

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/R6R310LEU4)
