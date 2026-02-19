import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { IconSymbol } from "@/components/ui/icon-symbol";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function PrivacyPolicyModal({ visible, onClose }: Props) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Politica de confidențialitate</Text>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.closeButton,
              { opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <IconSymbol name="xmark" size={18} color="#666" />
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator
        >
          <Text style={styles.sectionTitle}>Cuprins</Text>
          <Text style={styles.body}>
            Structura Politicii de confidențialitate vă ajută să navigați ușor
            către informațiile de interes{"\n\n"}• Rezumatul modificărilor{"\n"}
            • Vă mulțumim că folosiți Connect!{"\n"}• Colectăm informații în
            diverse moduri{"\n"}• Ce facem cu informațiile pe care le colectăm
            {"\n"}• Partajarea informațiilor dumneavoastră{"\n"}• Opțiunile
            dumneavoastră privind utilizarea informațiilor personale{"\n"}• Cum
            și când partajăm informațiile{"\n"}• Cât timp păstrăm informațiile
            dumneavoastră{"\n"}• Politica de confidențialitate pentru copii
            {"\n"}• Cazurile de utilizare{"\n"}• Cum facem modificări în această
            Politică{"\n"}• Confidențialitatea conform GDPR{"\n"}• Drepturile
            dumneavoastră în conformitate cu GDPR{"\n"}• Cum pot cere ștergerea
            datelor mele?{"\n"}• Exercitarea drepturilor dumneavoastră privind
            protecția datelor în temeiul GDPR{"\n"}• Contactați-ne
          </Text>

          <Text style={styles.sectionTitle}>Rezumatul modificărilor</Text>
          <Text style={styles.body}>
            Am descris în detaliu ce informații colectăm și cum le folosim și am
            introdus, de asemenea, o nouă modalitate de gestionare a creării de
            rapoarte privind performanța publicitară.
          </Text>

          <Text style={styles.sectionTitle}>
            Vă mulțumim că folosiți Connect!
          </Text>
          <Text style={styles.body}>
            Misiunea noastră este să-i inspirăm pe oameni să facă ceea ce le
            place. Pe baza informațiilor primite de la dumneavoastră și de la
            terți, vă afișăm conținut personalizat care credem că v-ar putea
            interesa. Utilizăm aceste informații pe baza temeiurilor legale
            aplicabile.{"\n\n"}Am redactat această Politică pentru a vă ajuta să
            înțelegeți ce informații colectăm, cum le folosim și ce opțiuni
            aveți în legătură cu utilizarea lor. Fiind o companie care activează
            în mediul digital, unele dintre conceptele de mai jos pot părea
            puțin tehnice, însă am încercat să le explicăm cât mai simplu și
            clar posibil. Așteptăm cu interes întrebările și comentariile
            dumneavoastră legate de această Politică.
          </Text>

          <Text style={styles.sectionTitle}>
            Colectăm informații în diverse moduri
          </Text>
          <Text style={styles.subTitle}>
            1. Când ni le furnizați direct sau vă acordați consimțământul să le
            primim.
          </Text>
          <Text style={styles.body}>
            Prin înregistrarea pe site-ul Connect sau prin utilizarea acestuia,
            ne oferiți în mod voluntar anumite informații, inclusiv: numele și
            prenumele, adresa de e-mail, numărul de telefon, țara, fotografii,
            comentarii, nume de utilizator, parola pe care o alegeți în timpul
            înregistrării și orice alte informații trimise către noi. De
            asemenea, vă puteți partaja locația exactă prin intermediul
            fotografiilor. Vom continua să folosim adresa dumneavoastră IP
            pentru a aproxima locația, chiar dacă alegeți să nu distribuiți
            locația exactă. De asemenea, veți avea posibilitatea de a furniza
            alte informații despre dumneavoastră, cum ar fi sexul, vârsta și
            limba preferată.{"\n\n"}Dacă vă conectați contul de Facebook, Google
            sau alte servicii terțe la Connect, putem accesa informațiile
            disponibile acolo (cum ar fi prietenii sau contactele dumneavoastră)
            pentru a îmbunătăți experiența dumneavoastră de utilizare. Accesul
            la aceste informații depinde de politica de confidențialitate și de
            setările contului respectiv.
          </Text>

          <Text style={styles.subTitle}>
            2. De asemenea, primim informații tehnice atunci când utilizați
            Connect
          </Text>
          <Text style={styles.body}>
            Atunci când accesați un website, utilizați o aplicație mobilă sau un
            alt serviciu online, anumite informații despre activitatea
            dumneavoastră pe internet sunt create și înregistrate automat.
            Același lucru se întâmplă și când folosiți Connect. Iată câteva
            dintre tipurile de informații pe care le colectăm:{"\n\n"}
            <Text style={styles.bold}>Date de conectare.</Text> Când folosiți
            Connect, serverele noastre înregistrează informații („date de
            conectare&quot;), inclusiv informații transmise automat de browserul
            dumneavoastră sau de aplicația mobilă. Datele de conectare includ
            adresa dumneavoastră IP (utilizată pentru a aproxima locația),
            interogările de căutare, tipul și setările browserului, data și ora
            solicitării, modul în care utilizați Connect, datele din cookie-uri
            și informații despre dispozitiv.{"\n\n"}
            <Text style={styles.bold}>Modulele cookie.</Text> Folosim, de
            asemenea, module cookie (fișiere text mici trimise de computerul
            dumneavoastră de fiecare dată când accesați site-ul nostru, unice
            pentru contul dumneavoastră Connect sau pentru browserul
            dumneavoastră), precum și tehnologii similare, pentru a colecta date
            de jurnal. Atunci când utilizăm module cookie sau tehnologii
            similare, implementăm module cookie de sesiune (care rămân active
            până la închiderea browserului) sau module cookie persistente (care
            rămân active până când dumneavoastră sau browserul dumneavoastră le
            ștergeți).{"\n\n"}
            <Text style={styles.bold}>Informații despre dispozitiv.</Text> Pe
            lângă datele de conectare, colectăm informații despre dispozitivul
            de pe care vă conectați la Connect, inclusiv tipul dispozitivului,
            sistemul de operare, setările, identificatorii unici ai
            dispozitivului și date despre erori.{"\n\n"}
            <Text style={styles.bold}>
              Date despre vizite și concluzii.
            </Text>{" "}
            Când interacționați cu Connect, folosim informațiile despre
            acțiunile dumneavoastră, împreună cu cele furnizate la înregistrare,
            pentru a trage concluzii cu privire la dumneavoastră și preferințele
            pe care le aveți.
          </Text>

          <Text style={styles.sectionTitle}>
            Ce facem cu informațiile pe care le colectăm
          </Text>
          <Text style={styles.body}>
            Dorim să vă oferim conținut relevant, interesant și personalizat.
            Pentru a face acest lucru, îmbunătățim calitatea serviciului nostru
            folosind informațiile pe care ni le furnizați. Cu ajutorul acestor
            informații, putem:{"\n\n"}• Detecta când folosiți Connect.{"\n"}•
            Răspunde întrebărilor sau comentariilor dumneavoastră.{"\n\n"}Avem
            dreptul legal de a folosi informațiile dumneavoastră în acest mod.
            Acesta este un aspect esențial pentru funcționarea serviciului,
            astfel încât serviciul Connect și funcționalitățile sale să
            corespundă intereselor dumneavoastră.{"\n\n"}De asemenea, avem
            dreptul legal de a asigura securitatea platformei Connect și de a
            îmbunătăți produsele noastre, oferindu-vă posibilitatea de a găsi
            inspirația pe care o căutați. Utilizarea informațiilor despre
            dumneavoastră aduce beneficii reciproce. Datorită acestor
            informații, putem:{"\n\n"}• Colabora cu autoritățile competente și
            asigura securitatea pe platforma Connect.{"\n"}• Vizualiza mesajele
            dumneavoastră de pe Connect pentru a identifica activități care ar
            putea constitui o amenințare.{"\n"}• Efectua analize și cercetări
            privind utilizarea platformei Connect.{"\n"}• Îmbunătăți Connect și
            introduce funcționalități noi.{"\n"}• Să vă trimitem actualizări și
            alte noutăți legate de platformă prin e-mail.
          </Text>

          <Text style={styles.sectionTitle}>
            Partajarea informațiilor dumneavoastră
          </Text>
          <Text style={styles.body}>
            Connect este o platformă pentru crearea de cursuri online. Prin
            utilizarea produselor sau serviciilor noastre, ne autorizați să
            transferăm și să stocăm informații în afara țării dumneavoastră,
            inclusiv în Statele Unite, în scopurile descrise în această
            Politică. Legile care protejează confidențialitatea și drepturile
            autorităților de a accesa datele dumneavoastră personale în aceste
            țări pot fi diferite de cele în vigoare în țara dumneavoastră.
          </Text>

          <Text style={styles.sectionTitle}>
            Opțiunile dumneavoastră privind utilizarea informațiilor personale
          </Text>
          <Text style={styles.body}>
            Scopul nostru este să vă oferim opțiuni simple și relevante în ceea
            ce privește informațiile personale. Dacă aveți un cont Connect,
            multe dintre controale sunt integrate direct în platformă sau în
            setările dumneavoastră. De exemplu, puteți:{"\n\n"}• Edita oricând
            informațiile din profilul dumneavoastră.{"\n"}• Conecta sau
            deconecta contul Connect de la alte servicii (Facebook, Google).
            {"\n"}• Modifica setările cursului.{"\n"}• Șterge contul în orice
            moment.
          </Text>

          <Text style={styles.sectionTitle}>
            Cum și când partajăm informațiile
          </Text>
          <Text style={styles.body}>
            Orice utilizator poate vizualiza cursurile publice pe care le
            creați, precum și informațiile de profil pe care ni le furnizați. De
            asemenea, furnizăm datele dumneavoastră:{"\n\n"}• Altor servicii,
            pentru ca dumneavoastră să vă puteți înregistra sau autentifica pe
            Connect, sau în cazul în care decideți să vă conectați contul
            Connect cu aceste servicii.{"\n"}• Serviciilor prin intermediul
            cărora vă oferim periodic acces la platforma Connect.{"\n"}•
            Autorităților de aplicare a legii sau instituțiilor guvernamentale,
            numai în cazul în care considerăm că divulgarea este justificat
            necesară.
          </Text>

          <Text style={styles.sectionTitle}>
            Cât timp păstrăm informațiile dumneavoastră
          </Text>
          <Text style={styles.body}>
            Păstrăm informațiile dumneavoastră doar atât timp cât este necesar
            pentru ca platforma Connect să funcționeze și pentru a atinge
            scopurile descrise în această Politică. Dacă nu mai avem nevoie să
            utilizăm informațiile dumneavoastră și nu suntem obligați legal sau
            prin reglementări să le păstrăm, le vom elimina din sistemele
            noastre sau vom elimina elementele care permit identificarea
            dumneavoastră.
          </Text>

          <Text style={styles.sectionTitle}>
            Politica de confidențialitate pentru copii
          </Text>
          <Text style={styles.body}>
            Connect nu este destinat utilizării de către copii cu vârsta sub 13
            ani. Dacă sunteți rezident în Spațiul Economic European (SEE),
            puteți utiliza Connect doar după ce ați împlinit vârsta la care vă
            puteți da consimțământul pentru prelucrarea datelor, conform
            legislației din țara dumneavoastră. Dacă aflați că copiii
            dumneavoastră folosesc Connect și nu doriți acest lucru, vă rugăm să
            ne contactați.
          </Text>

          <Text style={styles.sectionTitle}>Cazurile de utilizare</Text>
          <Text style={styles.body}>
            Aveți opțiuni suplimentare în ceea ce privește informațiile pe care
            le primim de la dumneavoastră. De exemplu:{"\n\n"}• Solicitați acces
            la datele dumneavoastră personale pe care le colectăm și le stocăm.
            {"\n"}• Dacă nu sunteți de acord cu prelucrarea informațiilor
            dumneavoastră, ne puteți cere să încetăm prelucrarea datelor.{"\n"}•
            Solicitați informații suplimentare cu privire la datele pe care le
            colectăm.{"\n\n"}Nu vindem informațiile personale ale utilizatorilor
            noștri.{"\n\n"}Pentru mai multe informații sau pentru a exercita
            aceste drepturi, contactați-ne la adresa support@deepvision.team.
          </Text>

          <Text style={styles.sectionTitle}>
            Cum facem modificări în această Politică de confidențialitate
          </Text>
          <Text style={styles.body}>
            Este posibil să modificăm această politică din când în când. În
            acest caz, vom publica modificările pe această pagină. Dacă veți
            continua să folosiți Connect după ce modificările intră în vigoare,
            acest lucru va însemna că sunteți de acord cu noua politică.
          </Text>

          <Text style={styles.sectionTitle}>
            Confidențialitate conform GDPR
          </Text>
          <Text style={styles.subTitle}>
            Temeiul legal pentru prelucrarea datelor cu caracter personal
            conform GDPR
          </Text>
          <Text style={styles.body}>
            Putem prelucra datele cu caracter personal în baza următoarelor
            condiții:{"\n\n"}• <Text style={styles.bold}>Consimțământ:</Text>{" "}
            V-ați exprimat consimțământul pentru prelucrarea datelor cu caracter
            personal în unul sau mai multe scopuri specifice.{"\n"}•{" "}
            <Text style={styles.bold}>Executarea unui contract:</Text>{" "}
            Furnizarea datelor cu caracter personal este necesară pentru
            executarea unui contract încheiat cu dumneavoastră.{"\n"}•{" "}
            <Text style={styles.bold}>Obligații legale:</Text> Prelucrarea
            datelor cu caracter personal este necesară pentru respectarea unei
            obligații legale care revine Organizației.{"\n"}•{" "}
            <Text style={styles.bold}>Interese vitale:</Text> Prelucrarea
            datelor cu caracter personal este necesară pentru protejarea
            intereselor vitale ale dumneavoastră sau ale altei persoane fizice.
            {"\n"}• <Text style={styles.bold}>Interes public:</Text> Prelucrarea
            datelor cu caracter personal are legătură cu o sarcină îndeplinită
            în interes public.{"\n"}•{" "}
            <Text style={styles.bold}>Interese legitime:</Text> Prelucrarea
            datelor cu caracter personal este necesară în scopul intereselor
            legitime urmărite de Organizație.
          </Text>

          <Text style={styles.sectionTitle}>
            Drepturile dumneavoastră în conformitate cu GDPR
          </Text>
          <Text style={styles.body}>
            Ne angajăm să respectăm confidențialitatea datelor dumneavoastră cu
            caracter personal și să vă garantăm posibilitatea de a vă exercita
            drepturile.{"\n\n"}În conformitate cu această Politică de
            confidențialitate și cu legislația aplicabilă, dacă vă aflați în UE,
            aveți următoarele drepturi:{"\n\n"}•{" "}
            <Text style={styles.bold}>
              De a solicita accesul la datele dumneavoastră cu caracter
              personal.
            </Text>{" "}
            Dreptul de a accesa, actualiza sau șterge informațiile pe care le
            deținem despre dumneavoastră.{"\n"}•{" "}
            <Text style={styles.bold}>
              De a solicita corectarea datelor cu caracter personal.
            </Text>{" "}
            Dacă deținem informații incomplete sau inexacte, aveți dreptul de a
            solicita corectarea acestora.{"\n"}•{" "}
            <Text style={styles.bold}>
              De a refuza prelucrarea datelor dumneavoastră cu caracter
              personal.
            </Text>{" "}
            Acest drept este valabil în situațiile în care ne bazăm pe un
            interes legitim ca temei legal al prelucrării.{"\n"}•{" "}
            <Text style={styles.bold}>
              De a solicita radierea datelor dumneavoastră cu caracter personal.
            </Text>{" "}
            Puteți solicita radierea acestora atunci când nu mai există un motiv
            justificat pentru a continua prelucrarea.{"\n"}•{" "}
            <Text style={styles.bold}>De a vă retrage consimțământul.</Text> În
            cazul retragerii consimțământului, este posibil să nu mai putem
            furniza anumite funcționalități specifice ale serviciului.{"\n"}•{" "}
            <Text style={styles.bold}>
              De a solicita ștergerea datelor dumneavoastră personale.
            </Text>{" "}
            Aveți dreptul de a solicita ștergerea informațiilor pe care le
            deținem despre dumneavoastră.
          </Text>

          <Text style={styles.sectionTitle}>
            Cum cer ca datele mele să fie șterse?
          </Text>
          <Text style={styles.body}>
            Ar trebui să ne contactați prin e-mail la adresa
            support@deepvision.team și să ne comunicați ce date cu caracter
            personal doriți să fie șterse. Nu este necesar să vă adresați unei
            persoane anume – este suficient să trimiteți un e-mail cu cererea
            dumneavoastră.
          </Text>

          <Text style={styles.sectionTitle}>Contactați-ne</Text>
          <Text style={styles.body}>
            Dacă aveți întrebări cu privire la această Declarație de
            confidențialitate, vă rugăm să ne contactați:{"\n\n"}Prin e-mail:
            support@deepvision.team
          </Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    color: "#1A1A1A",
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    color: "#1A1A1A",
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    marginTop: 24,
    marginBottom: 8,
  },
  subTitle: {
    color: "#1A1A1A",
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    marginTop: 16,
    marginBottom: 6,
  },
  body: {
    color: "#444",
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    lineHeight: 22,
    marginBottom: 8,
  },
  bold: {
    fontFamily: "Poppins_700Bold",
    color: "#1A1A1A",
  },
});
