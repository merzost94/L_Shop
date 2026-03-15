type HtmlValue = string | number | boolean | null | undefined;
export function html(strings: TemplateStringsArray, ...values: HtmlValue[]): string {
    return strings.reduce((result, str, i) => {
        const value = values[i] !== undefined ? values[i] : '';
        return result + str + value;
    }, '');
}