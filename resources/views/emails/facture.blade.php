<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8" />
    <title>Facture</title>
</head>
<body>
    <p>Bonjour,</p>
    <p>Veuillez trouver ci-joint la facture <strong>{{ $facture->reference ?? $facture->id }}</strong>.</p>
    <p>Cordialement,</p>
    <p>L'équipe</p>
</body>
</html>
