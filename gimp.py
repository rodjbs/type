#### Como usar script:
#### copy paste disto tudo
#### usar com uma imagem aberta e vazia
#### as pastas especificadas neste código têm de ser previamente criadas
#### chamar run()

img = None

class Group:
	def __init__(self, name, layernames, layertexts):
		assert len(layernames) == len(layertexts)
		self.name = name
		self.layernames = layernames
		self.layertexts = layertexts
		self.layergroup = pdb.gimp_layer_group_new(img)
		self.layergroup.name = name
		pdb.gimp_image_insert_layer(img, self.layergroup, None, 0)
	
	def layers(self):
		return self.layergroup.children

def init():
	global img
	img = gimp.image_list()[0]
	gimp.set_foreground(255,255,255)
	new_group('letras', 'abcdefghijklmnopqrstuvwxyz', 'abcdefghijklmnopqrstuvwxyz')
	new_group('acentos', ['agudo', 'grave', 'circunflexo', 'til'], ['á', 'à', 'â', 'ã'])
	new_group('outros', ['hífen', 'cedilha'], ['-', 'ç'])


groups = {}
def new_group(name, layernames, layertexts):
	groups[name] = Group(name, layernames, layertexts)

def new_layer(name, text, group, fontsize, fontcolor, is_outline):
	l = pdb.gimp_text_fontname(img, None, 0, 0, text, -1, True, fontsize, 1, 'Bitstream Vera Sans Mono')
	l2 = l.copy()
	pdb.gimp_image_remove_layer(img, l)
	pdb.gimp_image_insert_layer(img, l2, group, 0)
	# operations on layer:
	l2.name = name
	pdb.gimp_text_layer_set_color(l2, fontcolor)
	if(is_outline):
		vectors = pdb.gimp_vectors_new_from_text_layer(img, l2)
		pdb.gimp_image_insert_vectors(img, vectors, None, 0)
		pdb.gimp_image_select_item(img, CHANNEL_OP_REPLACE, vectors)
		pdb.gimp_selection_shrink(img, 1)
		pdb.gimp_edit_bucket_fill(l2, FG_BUCKET_FILL, NORMAL_MODE, 100, 0, False, 0, 0)
	pdb.gimp_item_set_visible(l2, False)
	return l2

# Group, int, int^3, bool
def new_layers(group, fontsize, fontcolor, with_outline):
	for name, s in zip(group.layernames, group.layertexts):
		new_layer(name, s, group.layergroup, fontsize, fontcolor, False)
		if with_outline:
			new_layer(name + 'out', s, group.layergroup, fontsize, fontcolor, True)

# arg types :: (int, int^3, bool)
def letters(fontsize, fontcolor, with_outline):
	for group in groups.values():
		new_layers(group, fontsize, fontcolor, with_outline)
	pdb.gimp_image_resize_to_layers(img)

# chamar depois de seleccionar área a ser recortada
def finish_accents():
	for layer in groups['acentos'].layers():
		pdb.gimp_edit_clear(layer)

root_filename = '/home/rodrigo/code/type/img/letters'

def save_png(layers, folder, name):
	for l in layers:
		pdb.gimp_item_set_visible(l, True)
	new_image = pdb.gimp_image_duplicate(img)
	merge = pdb.gimp_image_merge_visible_layers(new_image, 0)
	pdb.file_png_save(new_image, merge, root_filename + '/' + folder + '/' + name + '.png', name, 0, 9, 1, 1, 1, 1, 1)
	pdb.gimp_image_delete(new_image)
	for l in layers:
		pdb.gimp_item_set_visible(l, False)

def layer_by_name(name):
	all_layers = []
	for group in groups.values():
		all_layers.extend(group.layers())
	ls = filter(lambda l: l.name == name, all_layers)
	if len(ls) == 0:
		return None
	else:
		return ls[0]

def save_layers_by_name(names, folder, pngname):
	ls = [layer_by_name(name) for name in names]
	save_png(ls, folder, pngname)

def all_layers_invisible():
	for g in groups.values():
		for l in g.layers():
			pdb.gimp_item_set_visible(l, False)

def save_images(folder, with_outline):
	all_layers_invisible()
	for l in groups['letras'].layers() + groups['outros'].layers():
		save_png([l], folder, l.name)
	global next
	next = lambda: save_accents(folder, with_outline)
	pdb.gimp_item_set_visible(layer_by_name('i'), True)
	print("selecciona a pinta da letra i e chama next()")

def save_accents(folder, with_outline):
	all_layers_invisible()
	cut_i_dot(with_outline)
	save_png([layer_by_name('i')], folder, 'icut')
	if with_outline:
		save_png([layer_by_name('iout')], folder, 'icutout')
	for l in groups['acentos'].layers():
		save_png([l], folder, l.name)
	print("done")

def cut_i_dot(with_outline):
	pdb.gimp_edit_clear(layer_by_name('i'))
	if with_outline:
		pdb.gimp_edit_clear(layer_by_name('iout'))

def dorest(folder, with_outline):
	finish_accents()
	save_images(folder, with_outline)

next = None

rank_fontsize = [72, 72, 40, 20]
rank_color = [(0,0,0), (178,178,178), (178,178,178), (178,178,178)]
rank_outline = [True, False, False, False]

def run(rank):
	init()
	letters(rank_fontsize[rank], rank_color[rank], rank_outline[rank])
	global next
	next = lambda: dorest(str(rank), rank_outline[rank])
	pdb.gimp_item_set_visible(layer_by_name('til'), True)
	print("selecciona área de 'a' e chama next()")
