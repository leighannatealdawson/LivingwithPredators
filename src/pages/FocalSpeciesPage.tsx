export function SpeciesPage() {
  return (
    <article className="space-y-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-forest-100">
      </div>

      <h1 className="!font-serif">Species Information</h1>

      <p className="mx-auto max-w-prose text-base text-stone-700">
        The following questions in this survey relate to two species found in Ireland
        the European pine marten and the red fox
      </p>

      <div className="grid gap-8 md:grid-cols-2 items-center">
        {/* Pine Marten */}
        <div className="space-y-3">
          <img
            src="/pm.jpg"
            alt="European Pine Marten"
            className="mx-auto rounded-2xl shadow-md max-h-64 object-cover"
          />
          <p className="font-semibold">European Pine Marten</p>
          <p className="text-sm text-stone-600 italic">Martes martes</p>
          <p className="text-sm text-stone-600">Irish Cat Crainn</p>
        </div>

        {/* Red Fox */}
        <div className="space-y-3">
          <img
            src="/fox.jpg"
            alt="Red Fox"
            className="mx-auto rounded-2xl shadow-md max-h-64 object-cover"
          />
          <p className="font-semibold">Red Fox</p>
          <p className="text-sm text-stone-600 italic">Vulpes vulpes</p>
          <p className="text-sm text-stone-600">Irish Sionnach Rua</p>
        </div>
      </div>

      <p className="mx-auto max-w-prose text-base text-stone-700">
        Please keep these species in mind when answering the questions
      </p>
    </article>
  );
}