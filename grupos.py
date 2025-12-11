# -*- coding: utf-8 -*-
import pandas as pd
import random

"""
#Leer archivo de excel
df = pd.read_excel('Singles.xlsx')

#Renombrar colmnas de orarios para que sean mas faciles de manejar
horario_cols = {
    df.columns[2]: "8_10",
    df.columns[3]: "10_12",
    df.columns[4]: "12_14",
    df.columns[5]: "14_16",
    df.columns[6]: "16_18"
}
df.rename(columns=horario_cols, inplace=True)

#Convertir la disponibilidad en listas
for col in horario_cols.values():
    df[col] = df[col].fillna("").apply(lambda x: x.split(", ") if x else [])

df_ranked = df.dropna(subset=["Ranking"]).sort_values(by="Ranking", ascending=True)
df_unranked = df[df["Ranking"].isna()]
df_sorted = pd.concat([df_ranked, df_unranked]).reset_index(drop=True)

# Preguntar cuántos DataFrames se van a crear
num_dfs = int(input("¿Cuántos DataFrames quieres crear? "))

# Crear una lista de DataFrames vacíos
dataframes = [pd.DataFrame(columns=df_sorted.columns) for _ in range(num_dfs)]


# Distribuir jugadores equitativamente en los DataFrames
for i, jugador in df_sorted.iterrows():
    dataframes[i % num_dfs] = pd.concat([dataframes[i % num_dfs], jugador.to_frame().T], ignore_index=True)

print(dataframes)"""

# %%


"""
#Guardar en un solo archivo Excel con varias hojas
output_file = "Jugadores_Por_Grupo.xlsx"
with pd.ExcelWriter(output_file, engine="xlsxwriter") as writer:
    for i, df in enumerate(dataframes):
        df.to_excel(writer, sheet_name=f"Grupo {i+1}", index=False)

print(f"Se ha creado el archivo {output_file} con {num_dfs} grupos en diferentes hojas.")



# Filtrar jugadores con ranking y horarios disponibles
df = df.dropna(subset=["Ranking"])
df = df[
    (df["8_10"].str.len() > 0) |
    (df["10_12"].str.len() > 0) |
    (df["12_14"].str.len() > 0) |
    (df["14_16"].str.len() > 0) |
    (df["16_18"].str.len() > 0)
]

# Ordenar jugadores por ranking (mejor ranking primero)
df = df.sort_values(by="Ranking", ascending=True)

# Resetear el índice
df = df.reset_index(drop=True)

# Guardar en un nuevo archivo Excel
df.to_excel("Jugadores_Filtrados.xlsx", index=False)"""


# %%

"""
import pandas as pd
from itertools import combinations

# Cargar el archivo
file_path = "Singles.xlsx"
xls = pd.ExcelFile(file_path)

# Leer la hoja "Singles"
df = pd.read_excel(xls, sheet_name="Singles")
#Renombrar colmnas de orarios para que sean mas faciles de manejar
horario_cols = {
    df.columns[2]: "8_10",
    df.columns[3]: "10_12",
    df.columns[4]: "12_14",
    df.columns[5]: "14_16",
    df.columns[6]: "16_18"
}
df.rename(columns=horario_cols, inplace=True)

# Renombrar columnas de horarios para facilidad
horario_cols = ["8_10", "10_12", "12_14", "14_16", "16_18"]

# Convertir horarios a listas de días
for col in horario_cols:
    df[col] = df[col].fillna("").apply(lambda x: set(x.split(", ")) if x else set())

# Ordenar jugadores: primero los que tienen ranking
df_ranked = df.dropna(subset=["Ranking"]).sort_values(by="Ranking", ascending=True)
df_unranked = df[df["Ranking"].isna()]
df_sorted = pd.concat([df_ranked, df_unranked]).reset_index(drop=True)

# Preguntar cuántos grupos se deben crear
num_grupos = int(input("¿Cuántos grupos quieres crear? "))

# Crear listas vacías para los grupos
grupos = [[] for _ in range(num_grupos)]
horarios_grupo = [set() for _ in range(num_grupos)]  # Guardar horarios en cada grupo

# Asignar jugadores a grupos
for jugador in df_sorted.itertuples():
    jugador_horarios = set.union(*[getattr(jugador, col) for col in horario_cols])

    # Buscar un grupo donde haya coincidencia de al menos un horario
    asignado = False
    for i in range(num_grupos):
        if horarios_grupo[i] & jugador_horarios:  # Hay coincidencia en al menos un horario
            grupos[i].append(jugador)
            horarios_grupo[i] |= jugador_horarios  # Actualizar horarios del grupo
            asignado = True
            break

    # Si no hay coincidencia con ningún grupo, asignarlo al grupo con menos jugadores
    if not asignado:
        min_index = min(range(num_grupos), key=lambda x: len(grupos[x]))
        grupos[min_index].append(jugador)
        horarios_grupo[min_index] |= jugador_horarios

# Convertir los grupos en DataFrames
dfs = [pd.DataFrame(grupo) for grupo in grupos]
"""

# %%

import pandas as pd
import numpy as np

# Cargar el archivo
file_path = "Dobles.xlsx"
xls = pd.ExcelFile(file_path)

# Leer la hoja "Singles"
df = pd.read_excel(xls, sheet_name="Registros")

horario_cols = {
    df.columns[12]: "8_10",
    df.columns[13]: "10_12",
    df.columns[14]: "12_14",
    df.columns[15]: "14_16",
    df.columns[16]: "16_18",
}
df.rename(columns=horario_cols, inplace=True)
# Preguntar cuántos DataFrames se van a crear
num_dfs = int(input("¿Cuántos DataFrames quieres crear? "))

# Filtrar jugadores con ranking y sin ranking
df_ranked = (
    df.dropna(subset=["Ranking"])
    .sort_values(by="Ranking", ascending=True)
    .reset_index(drop=True)
)
df_unranked = df[df["Ranking"].isna()].reset_index(drop=True)

# Separar la primera mitad de los jugadores con ranking (ordenados)
midpoint = len(df_ranked) // 2
ranked_first_half = df_ranked.iloc[:midpoint]  # Ordenados
ranked_second_half = (
    df_ranked.iloc[midpoint:].sample(frac=1).reset_index(drop=True)
)  # Mezclados

# Mezclar jugadores sin ranking aleatoriamente
df_unranked = df_unranked.sample(frac=1).reset_index(drop=True)

# Unir todos los jugadores en el orden correcto
players_list = pd.concat(
    [ranked_first_half, ranked_second_half, df_unranked]
).reset_index(drop=True)

# Dividir los jugadores en los DataFrames solicitados
dataframes = []
for i in range(num_dfs):
    dataframes.append(players_list.iloc[i::num_dfs].reset_index(drop=True))

# Mostrar resumen de asignación
for i, df_group in enumerate(dataframes):
    print(f"\nDataFrame {i+1} - {len(df_group)} jugadores")
    print(df_group[["Nombre del equipo", "Ranking"]])
