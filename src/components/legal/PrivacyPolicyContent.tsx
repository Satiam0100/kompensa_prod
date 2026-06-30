export function PrivacyPolicyContent() {
  return (
    <div className="prose-policy space-y-8 text-body-md text-on-surface-variant">
      <p className="text-body-sm">
        Última actualización: mayo de 2026
      </p>

      <section className="space-y-3">
        <h2 className="text-title-md text-on-surface">1. Responsable del tratamiento</h2>
        <p>
          Kompensa (en adelante, «Kompensa» o «nosotros») es el responsable del
          tratamiento de los datos personales tratados a través del panel
          disponible en{" "}
          <strong className="text-on-surface">app.kompensa.me</strong>.
        </p>
        <p>
          Contacto para cuestiones de privacidad:{" "}
          <a
            href="mailto:privacidad@kompensa.me"
            className="text-primary underline underline-offset-2 hover:brightness-110"
          >
            privacidad@kompensa.me
          </a>
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-title-md text-on-surface">2. Ámbito de aplicación</h2>
        <p>
          Esta política describe cómo tratamos los datos personales en el
          contexto del servicio de gestión de órdenes de transmisión y
          certificación publicitaria. Aplica a los usuarios autorizados de la
          plataforma y a los datos de terceros (clientes finales) que dichos
          usuarios introducen en el sistema.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-title-md text-on-surface">3. Datos que recogemos</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-on-surface">Datos de usuarios de la plataforma:</strong>{" "}
            credenciales de acceso y datos de sesión necesarios para la
            autenticación.
          </li>
          <li>
            <strong className="text-on-surface">Datos de clientes introducidos por usuarios:</strong>{" "}
            nombre o razón social del cliente, nombre de campaña, correo
            electrónico, número de teléfono (incluido WhatsApp), datos
            contractuales y de transmisión (emisora, fechas, cuñas, certificados,
            etc.).
          </li>
          <li>
            <strong className="text-on-surface">Datos técnicos:</strong> registros
            de operación, identificadores de orden y metadatos de almacenamiento
            asociados al servicio.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-title-md text-on-surface">4. Finalidades y bases legales</h2>
        <p>Tratamos los datos personales para:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            Gestionar órdenes de transmisión, certificados y comunicaciones
            relacionadas con el servicio contratado (ejecución del contrato e
            interés legítimo en la prestación del servicio).
          </li>
          <li>
            Enviar certificados y notificaciones al email o teléfono del cliente
            indicado por el usuario de la plataforma.
          </li>
          <li>
            Garantizar la seguridad, integridad y trazabilidad del sistema
            (interés legítimo).
          </li>
        </ul>
        <p>
          Los usuarios de la plataforma que introducen datos de terceros deben
          contar con una base legal propia (consentimiento, contrato, interés
          legítimo u otra aplicable) para comunicarnos dichos datos y deben
          informar a sus clientes cuando corresponda.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-title-md text-on-surface">5. Destinatarios y encargados</h2>
        <p>
          Podemos compartir datos con proveedores que nos prestan servicios
          necesarios para la operación de la plataforma, como alojamiento en la
          nube, bases de datos, generación de documentos y automatización de
          flujos. Estos proveedores actúan como encargados del tratamiento y
          están sujetos a obligaciones contractuales de confidencialidad y
          seguridad.
        </p>
        <p>
          No vendemos datos personales a terceros.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-title-md text-on-surface">6. Conservación</h2>
        <p>
          Conservamos los datos mientras sea necesario para cumplir las
          finalidades descritas, atender obligaciones legales y resolver
          reclamaciones. Los plazos concretos pueden variar según el tipo de
          dato y la relación contractual con el usuario de la plataforma.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-title-md text-on-surface">7. Transferencias internacionales</h2>
        <p>
          Si alguno de nuestros proveedores trata datos fuera del Espacio
          Económico Europeo u otra jurisdicción con normas equivalentes,
          adoptaremos las garantías adecuadas exigidas por la normativa
          aplicable (cláusulas contractuales tipo u otros mecanismos reconocidos).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-title-md text-on-surface">8. Derechos de las personas interesadas</h2>
        <p>
          Las personas cuyos datos figuren en el sistema pueden ejercer, cuando
          proceda, los derechos de acceso, rectificación, supresión, limitación,
          oposición y portabilidad, así como retirar el consentimiento cuando
          el tratamiento se base en él.
        </p>
        <p>
          Para ejercer estos derechos, pueden contactar en{" "}
          <a
            href="mailto:privacidad@kompensa.me"
            className="text-primary underline underline-offset-2 hover:brightness-110"
          >
            privacidad@kompensa.me
          </a>
          . También tienen derecho a presentar una reclamación ante la autoridad
          de protección de datos competente.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-title-md text-on-surface">9. Seguridad</h2>
        <p>
          Aplicamos medidas técnicas y organizativas razonables para proteger
          los datos personales frente a acceso no autorizado, pérdida o
          alteración, incluyendo control de acceso, cifrado en tránsito cuando
          procede y almacenamiento seguro.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-title-md text-on-surface">10. Cambios en esta política</h2>
        <p>
          Podemos actualizar esta política para reflejar cambios legales o en el
          servicio. Publicaremos la versión vigente en esta misma página e
          indicaremos la fecha de última actualización.
        </p>
      </section>
    </div>
  );
}
