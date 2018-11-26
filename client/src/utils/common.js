// Lightbox css
import "react-image-lightbox/style.css"; // This only needs to be imported once in your app

export const urls = {
    root: "/",
    quiz: "/quiz",
    add: "/add",
    about: "/om-siden",
    feedback: "/feedback",
    signup: "/opret",
    login: "/login",
    logout: "/logout",
    profile: "/profil",
    editProfile: "/profil/rediger",
    forgotPassword: "/glemt-kodeord", //HVIS DENNE ÆNDRES SKAL OGSÅ ÆNDRES I API'ens config/urls.js
    resetPassword: "/nyt-kodeord",
    print: "/print"
};

export const semestre = [
    { text: "7. semester (Inflammation)", value: 7 },
    { text: "8. semester (Abdomen)", value: 8 }
    /*{ text: "9. semester (Hjerte-lunge-kar)", value: 9 },
    { text: "11. semester (Familie-samfund / GOP)", value: 11 } */
];

export const specialer = {
    7: [
        { value: "gastroenterologi", text: "Gastroenterologi" },
        { value: "hæmatologi", text: "Hæmatologi" },
        { value: "infektionsmedicin", text: "Infektionsmedicin" },
        { value: "nefrologi", text: "Nefrologi" },
        { value: "reumatologi", text: "Reumatologi" },
        { value: "almen_medicin", text: "Almen medicin" },
        { value: "paraklinik", text: "Paraklinik" }
        /*{ value: "klinisk_biokemi", text: "Klinisk biokemi" },
        { value: "klinisk_mikrobiologi", text: "Klinisk mikrobiologi" },
        { value: "klinisk_immunologi", text: "Klinisk immunologi" },
        { value: "radiologi", text: "Radiologi" } */
    ],
    8: [
        {
            value: "abdominalkirurgi",
            text: "Abdominalkirurgi"
        },
        { value: "plastikkirurgi", text: "Plastikkirurgi" },
        {
            value: "urologi",
            text: "Urologi"
        },
        { value: "onkologi", text: "Onkologi" },
        { value: "socialmedicin", text: "Socialmedicin" },
        //    { value: "almen_medicin", text: "Almen medicin" },
        { value: "paraklinik", text: "Paraklinik" }
    ]
    /*9: [
        { value: "anæstesiologi", text: "Anæstesiologi" },
        {
            value: "kardiologi",
            text: "Kardiologi"
        },
        { value: "lungemedicin", text: "Lungemedicin" },
        { value: "karkirurgi", text: "Karkirurgi" },
        { value: "thoraxkirurgi", text: "Thoraxkirurgi" },
        //{ value: "almen_medicin", text: "Almen medicin" },
        { value: "paraklinik", text: "Paraklinik" }
    ],
    11: [
        { value: "gyn", text: "Gynækologi/Gynaecology" },
        { value: "obs", text: "Obstetrik/Obstetrics" },
        { value: "pæd/ped", text: "Pædiatri/Pediatrics" },
        {
            value: "retsmedicin/forensic_medicine",
            text: "Retsmedicin/Forensic medicine"
        },
        {
            value: "klinisk_genetik/clinical_genetics",
            text: "Klinisk genetik/Clinical genetics"
        },
        //{ value: "almen_medicin/gp", text: "Almen medicin/General practice" },
        { value: "paraklinik/paraclinical", text: "Paraklinik/Paraclinical" }
    ] */
};

export const breakpoints = {
    mobile: 768
};

export const imageURL = image => {
    if (image.match("cloudinary")) {
        return image;
    } else {
        return `/images/${image}`;
    }
};
export const truncateText = (text, length = 30) => {
    if (!text) return;
    if (text.length + 3 > length) {
        return text.substring(0, length) + " ...";
    } else return text;
};