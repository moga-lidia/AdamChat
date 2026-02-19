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

export function TermsModal({ visible, onClose }: Props) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Termeni de utilizare</Text>
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
          <Text style={styles.body}>Vă mulțumim că folosiți Connect!</Text>
          <Text style={styles.body}>
            Acești Termeni de utilizare ({"\u201E"}Termenii{"\u201D"})
            reglementează accesul dumneavoastră la website-ul Connect,
            aplicațiile, API-ul și widgeturile Connect, precum și utilizarea
            acestora ({"\u201E"}Connect{"\u201D"} sau
            {"\u201E"}Serviciul{"\u201D"}). Vă rugăm să citiți cu atenție acești
            Termeni și să ne contactați dacă aveți întrebări. Prin accesarea sau
            utilizarea platformei Connect, sunteți de acord cu acești Termeni,
            cu Politica noastră de confidențialitate, Politica privind modulele
            cookie și Regulile comunității.
          </Text>
          <Text style={styles.summary}>
            Pe scurt: Fiecare companie are propriii termeni de utilizare.
            Aceasta este versiunea noastră.
          </Text>

          <Text style={styles.sectionTitle}>1. Serviciul nostru</Text>
          <Text style={styles.body}>
            Connect vă ajută să învățați și să descoperiți lucruri noi. Pentru a
            face acest lucru, vă arătăm (recomandăm) cursuri care, în opinia
            noastră, sunt relevante și interesante pentru dumneavoastră, pe baza
            activității desfășurate pe site-ul nostru și în afara acestuia.
          </Text>
          <Text style={styles.summary}>
            Pe scurt: Connect vă ajută să învățați lucruri noi, online, oriunde
            v-ați afla. Platforma este personalizată pentru dumneavoastră. Avem
            nevoie să știm ce vă interesează cel mai mult și ce cunoștințe și
            abilități doriți să dobândiți cu ajutorul Connect.
          </Text>

          <Text style={styles.sectionTitle}>
            2. Utilizarea platformei Connect
          </Text>

          <Text style={styles.subTitle}>a. Cine poate folosi Connect</Text>
          <Text style={styles.body}>
            Puteți folosi Connect doar în baza unui contract cu valoare
            juridică, în conformitate cu acești Termeni și cu toate legile
            aplicabile. Atunci când creați un cont Connect, trebuie să ne
            furnizați informații corecte și complete. Nu puteți utiliza Connect
            dacă aveți sub 13 ani. Accesul și utilizarea platformei de către
            persoane sub această vârstă nu sunt permise. Dacă sunteți rezident
            în Spațiul Economic European (SEE), puteți folosi Connect doar după
            ce ați împlinit vârsta legală pentru a consimți la prelucrarea
            datelor cu caracter personal conform legislației din țara
            dumneavoastră, sau dacă ne-a fost acordat un consimțământ
            verificabil din partea părinților.
          </Text>

          <Text style={styles.subTitle}>
            b. Licența noastră pentru dumneavoastră
          </Text>
          <Text style={styles.body}>
            În conformitate cu acești Termeni și cu politicile noastre, vă
            oferim o licență limitată, neexclusivă, necomercială,
            netransferabilă și revocabilă pentru a utiliza Serviciul nostru.
          </Text>

          <Text style={styles.subTitle}>
            c. Utilizarea comercială a platformei Connect
          </Text>
          <Text style={styles.body}>
            Dacă doriți să folosiți Connect în scopuri comerciale, trebuie să
            creați un cont business și să fiți de acord cu Termenii noștri de
            utilizare comercială. Dacă creați un cont în numele unei companii,
            organizații sau altei entități, atunci dumneavoastră și entitatea
            respectivă sunteți incluși în termenul {"\u201E"}dumneavoastră
            {"\u201D"} și declarați că aveți autoritatea de a acorda toate
            permisiunile și licențele prevăzute în acești Termeni, de a garanta
            că entitatea va respecta acești Termeni și de a-i accepta în numele
            ei.
          </Text>
          <Text style={styles.summary}>
            Pe scurt: Nu puteți folosi Connect dacă aveți sub 13 ani (în unele
            țări, limita de vârstă poate fi mai mare). De asemenea, dacă
            utilizați Connect în scop profesional, trebuie să creați un cont
            business.
          </Text>

          <Text style={styles.sectionTitle}>3. Conținutul dumneavoastră</Text>

          <Text style={styles.subTitle}>a) Publicarea conținutului</Text>
          <Text style={styles.body}>
            Connect vă permite să publicați conținutul lecțiilor și al
            cursurilor, inclusiv fotografii, comentarii, linkuri și alte
            materiale. Tot ceea ce publicați sau distribuiți pe Connect este
            denumit {"\u201E"}Conținut al utilizatorului{"\u201D"}. Dețineți
            toate drepturile asupra conținutului pe care îl publicați pe Connect
            și sunteți pe deplin responsabil pentru acesta.
          </Text>
          <Text style={styles.summary}>
            Pe scurt: Dacă publicați conținut pe Connect, acesta rămâne al
            dumneavoastră.
          </Text>

          <Text style={styles.subTitle}>
            b) Utilizarea conținutului dumneavoastră de către Connect și alți
            utilizatori
          </Text>
          <Text style={styles.body}>
            Acordați platformei Connect și utilizatorilor noștri o licență
            globală, neexclusivă, gratuită, transferabilă și sublicențiabilă
            pentru a utiliza, stoca, afișa, reda, salva, modifica, crea lucrări
            derivate, prezenta și distribui Conținutul dumneavoastră pe Connect,
            exclusiv în scopul funcționării, dezvoltării, furnizării și
            utilizării serviciului Connect. Nimic din acești Termeni nu
            limitează alte drepturi legale pe care Connect le poate aplica
            asupra Conținutului utilizatorului, cum ar fi cele prevăzute prin
            alte licențe. Ne rezervăm dreptul de a șterge sau modifica
            Conținutul utilizatorului ori de a schimba modul în care acesta este
            utilizat pe Connect, din orice motiv. Acest lucru include conținutul
            care, în opinia noastră, încalcă acești Termeni, Regulile
            comunității sau alte politici.
          </Text>
          <Text style={styles.summary}>
            Pe scurt: Dacă publicați conținut pe Connect, îl putem recomanda
            (promova) altor utilizatori, care pot începe studierea cursului sau,
            în cazul unui curs plătit, îl pot achiziționa. Dacă ați făcut cursul
            public, alți autori pot realiza o copie sau o traducere a cursului
            în altă limbă. Drepturile de autor asupra cursului vor fi păstrate
            prin gestionarea versiunilor și traducerilor. Nu publicați conținut
            pornografic sau spam și mențineți o conduită respectuoasă pe
            Connect.
          </Text>

          <Text style={styles.subTitle}>
            c) Cât timp păstrăm conținutul dumneavoastră
          </Text>
          <Text style={styles.body}>
            După închiderea sau dezactivarea contului ori ștergerea unui
            Conținut al utilizatorului de pe Connect, putem păstra acest
            conținut pentru o perioadă rezonabilă, în scopuri de backup,
            arhivare sau audit. Connect și utilizatorii săi pot păstra și
            continua să utilizeze, stocheze, afișeze, redea, copieze și traducă
            cursuri ori versiuni modificate ale acestora, dacă au fost deja
            studiate sau adaptate de alți utilizatori pe platforma Connect.
          </Text>
          <Text style={styles.summary}>
            Pe scurt: Dacă publicați conținut, vă dați acordul ca acesta să fie
            utilizat pe platforma Connect. Copiile și traducerile conținutului
            pot fi păstrate chiar și după ștergerea conținutului asociat
            contului dumneavoastră.
          </Text>

          <Text style={styles.subTitle}>
            d. Feedback și sugestii din partea dumneavoastră
          </Text>
          <Text style={styles.body}>
            Apreciem feedbackul din partea utilizatorilor și suntem mereu
            interesați să aflăm cum putem îmbunătăți Connect. Dacă ne trimiteți
            comentarii, idei sau sugestii, sunteți de acord că le putem utiliza
            fără nicio restricție sau obligație de recompensare. Prin acceptarea
            propunerilor dumneavoastră, Connect nu renunță la niciun drept de a
            folosi idei similare sau conexe cunoscute anterior de Connect,
            dezvoltate de angajații săi sau obținute din alte surse.
          </Text>
          <Text style={styles.summary}>
            Pe scurt: Putem folosi sugestiile dumneavoastră pentru îmbunătăți
            platforma Connect.
          </Text>

          <Text style={styles.sectionTitle}>
            4. Politica privind drepturile de autor
          </Text>
          <Text style={styles.body}>
            Connect a adoptat și implementat propria Politică de respectare a
            drepturilor de autor, în conformitate cu Legea privind drepturile de
            autor în era digitală și alte legi aplicabile în domeniu. Puteți
            afla mai multe în Politica noastră privind drepturile de autor.
          </Text>
          <Text style={styles.summary}>
            Pe scurt: Respectăm drepturile de autor și ne așteptăm ca și
            dumneavoastră să faceți la fel.
          </Text>

          <Text style={styles.sectionTitle}>5. Securitate</Text>
          <Text style={styles.body}>
            Ne pasă de siguranța utilizatorilor noștri. Deși depunem eforturi
            pentru a proteja conținutul și contul dumneavoastră, Connect nu
            poate garanta că terți neautorizați nu vor reuși să treacă peste
            măsurile noastre de securitate. Vă rugăm să păstrați parola secretă
            și să ne anunțați imediat dacă aveți suspiciuni privind
            compromiterea contului sau utilizarea neautorizată a acestuia.
          </Text>
          <Text style={styles.summary}>
            Pe scurt: Ne puteți ajuta să combatem spamul respectând regulile de
            securitate.
          </Text>

          <Text style={styles.sectionTitle}>
            6. Linkuri, website-uri și servicii terțe
          </Text>
          <Text style={styles.body}>
            Connect poate conține linkuri către site-uri web, servicii, reclame,
            oferte speciale, și alte evenimente sau activități ale unor terți
            care nu aparțin și nu sunt controlate de Connect. Nu susținem și nu
            ne asumăm responsabilitatea pentru site-uri, informații, materiale,
            produse sau servicii ale terților. Dacă accesați orice site sau
            serviciu al unui terț prin Connect, sunteți pe deplin responsabil
            pentru acea alegere și acceptați că Connect nu este răspunzător
            pentru accesarea sau utilizarea acelor servicii ori conținuturi.
          </Text>
          <Text style={styles.summary}>
            Pe scurt: Connect oferă linkuri către conținuturi externe. De cele
            mai multe ori sunt publicații excelente, dar nu ne asumăm
            responsabilitatea dacă nu sunt.
          </Text>

          <Text style={styles.sectionTitle}>
            7. Suspendarea sau închiderea contului
          </Text>
          <Text style={styles.body}>
            Connect poate suspenda sau încheia dreptul dumneavoastră de a accesa
            sau utiliza serviciul din orice motiv, cu notificare. Putem face
            acest lucru imediat și fără preaviz, dacă există un motiv întemeiat,
            inclusiv încălcarea Regulilor comunității. După ce accesul este
            retras, veți continua să aveți obligații în conformitate cu
            secțiunile 3 și 8 ale acestor Termeni.
          </Text>
          <Text style={styles.summary}>
            Pe scurt: Folosirea Connect este gratuită. Ne rezervăm dreptul de a
            refuza accesul oricui, dacă avem un motiv justificat.
          </Text>

          <Text style={styles.sectionTitle}>8. Garanții</Text>
          <Text style={styles.body}>
            Dacă folosiți Connect în scopuri comerciale (adică nu ca simplu
            consumator), și nu acceptați Termenii comerciali conform Secțiunii
            2(c), sunteți de acord să despăgubiți Connect Inc. pentru orice
            reclamații, acțiuni în justiție sau litigii, dispute, cereri,
            obligații, pierderi și cheltuieli, inclusiv, dar fără a se limita
            la, costuri rezonabile pentru servicii juridice și contabile
            (inclusiv cheltuieli pentru apărarea în fața unor reclamații,
            procese sau acțiuni inițiate de terți), care au legătură în orice
            mod cu accesul dumneavoastră la serviciul nostru sau utilizarea
            acestuia, cu Conținutul dumneavoastră de utilizator sau cu
            încălcarea oricăruia dintre acești Termeni.
          </Text>
          <Text style={styles.summary}>
            Pe scurt: Dacă activitatea dumneavoastră comercială pe Connect
            generează probleme legale, va trebui să suportați cheltuielile. În
            primul rând, trebuie să creați un cont business și să acceptați
            Termenii comerciali.
          </Text>

          <Text style={styles.sectionTitle}>
            9. Declarație de limitare a răspunderii
          </Text>
          <Text style={styles.body}>
            Serviciul și tot conținutul publicat pe Connect sunt furnizate{" "}
            {"\u201E"}ca atare{"\u201D"}, fără nicio garanție, expresă sau
            implicită.{"\n\n"}În acest sens, Connect respinge orice garanții și
            condiții privind vandabilitatea, potrivirea pentru un anumit scop,
            absența încălcărilor sau orice garanții implicite ce pot decurge din
            relațiile sau practicile comerciale.{"\n\n"}Connect nu este
            responsabil și nu poate fi tras la răspundere pentru conținutul
            publicat sau transmis prin serviciul nostru de către dumneavoastră,
            alți utilizatori sau terți. Înțelegeți și acceptați că este posibil
            să întâlniți conținut inexact, abuziv, nepotrivit pentru copii sau
            contrar așteptărilor dumneavoastră.
          </Text>
          <Text style={styles.summary}>
            Pe scurt: Din păcate, unii utilizatori pot publica cursuri
            necorespunzătoare sau ofensatoare. Tratăm aceste cazuri cu
            seriozitate, dar este posibil să întâlniți un astfel de conținut
            înainte să reușim să îl eliminăm. Dacă descoperiți materiale de
            acest tip, vă rugăm să ne anunțați.
          </Text>

          <Text style={styles.sectionTitle}>10. Dispoziții generale</Text>
          <Text style={styles.subTitle}>
            Procedura de notificare și modificarea Termenilor
          </Text>
          <Text style={styles.body}>
            Ne rezervăm dreptul de a stabili modalitatea și tipul notificărilor
            transmise și sunteți de acord să primiți notificări legale în format
            electronic, dacă decidem astfel. Acești Termeni pot fi modificați
            periodic, iar versiunea actualizată va fi întotdeauna disponibilă pe
            site-ul nostru. În cazul unor modificări semnificative, vă vom
            anunța. Continuând să utilizați Connect după ce modificările intră
            în vigoare, acceptați automat noii Termeni. Dacă nu sunteți de acord
            cu aceștia, trebuie să încetați utilizarea serviciului.
          </Text>
          <Text style={styles.summary}>
            Pe scurt: Vă vom anunța când apar modificări importante ale
            Termenilor. Dacă nu sunteți de acord cu noile prevederi, trebuie să
            încetați utilizarea Connect.
          </Text>

          <Text style={styles.effectiveDate}>
            În vigoare de la data de 5 mai 2020
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
  summary: {
    color: "#666",
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    fontStyle: "italic",
    lineHeight: 20,
    marginBottom: 8,
    paddingLeft: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#2f2482",
  },
  effectiveDate: {
    color: "#999",
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
    textAlign: "center",
    marginTop: 32,
    marginBottom: 16,
  },
});
