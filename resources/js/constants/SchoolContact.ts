export const SCHOOL_CONTACT = {
    email: (import.meta as any).env?.VITE_SCHOOL_EMAIL || 'admin.prepahid@gmail.com',
    whatsappNumber: (import.meta as any).env?.VITE_SCHOOL_WHATSAPP || '524433541441',
    whatsappFormatted: '443 354 1441',
    get mailtoLink() {
        return `mailto:${this.email}`;
    },
    get whatsappLink() {
        return `https://wa.me/${this.whatsappNumber}`;
    }
};
