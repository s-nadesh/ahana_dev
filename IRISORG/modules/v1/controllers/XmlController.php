<?php

namespace IRISORG\modules\v1\controllers;

use Yii;
use yii\filters\auth\QueryParamAuth;
use yii\filters\ContentNegotiator;
use yii\helpers\FileHelper;
use yii\web\Controller;
use yii\web\Response;
use \common\models\PatDocumentTypes;

class XmlController extends Controller {

    public function behaviors() {
        $behaviors = parent::behaviors();
        $behaviors['authenticator'] = [
            'class' => QueryParamAuth::className(),
            'only' => ['getnavigation', 'getconsultantcharges', 'switchbranch', 'getlog'],
        ];
        $behaviors['contentNegotiator'] = [
            'class' => ContentNegotiator::className(),
            'formats' => [
                'application/json' => Response::FORMAT_JSON,
            ],
        ];

        return $behaviors;
    }

    public function actionIndex() {
        echo "AAAAAAA";
        exit;
        return $this->render('index');
    }

    private function getAllFiles($foler_name = 'uploads') {
        $webroot = Yii::getAlias('@webroot');
        $files = FileHelper::findFiles($webroot . '/' . $foler_name, [
                    'only' => ['CH_*.xml'],
                    'recursive' => true,
        ]);
        $base_xml = [realpath(dirname(__FILE__) . '/../../../../IRISADMIN/web/case_history.xml')];
        $all_files = \yii\helpers\ArrayHelper::merge($base_xml, $files);
        return $all_files;
    }

    private function getAllMCHFiles($foler_name = 'uploads') {
        $webroot = Yii::getAlias('@webroot');
        $files = FileHelper::findFiles($webroot . '/' . $foler_name, [
                    'only' => ['MCH_*.xml'],
                    'recursive' => true,
        ]);
        $base_xml = [realpath(dirname(__FILE__) . '/../../../../IRISADMIN/web/medical_case_history.xml')];
        $all_files = \yii\helpers\ArrayHelper::merge($base_xml, $files);
        return $all_files;
    }

    private function getAllXmlXsltFiles() {
        $location = (dirname(__FILE__) . '/../../../../IRISADMIN/web/');
        $files = FileHelper::findFiles($location, [
                    'only' => ['*.xml', '*.xslt'],
                    'recursive' => true,
        ]);
        return $files;
    }

    private function createDDLItem($field, $item, $value) {
        $item = $field->addChild('LISTITEM', $item);
        $item->addAttribute('value', $value);
        $item->addAttribute('Selected', 'False');
    }

    private function createRadioButton($field, $item, $value, $id) {
        $item = $field->addChild('LISTITEM', $item);
        $item->addAttribute('value', $value);
        $item->addAttribute('id', $id);
        $item->addAttribute('Selected', 'False');
    }
    
    private function createCheckBox($field, $item, $value, $id) {
        $item = $field->addChild('LISTITEM', $item);
        $item->addAttribute('value', $value);
        $item->addAttribute('id', $id);
        $item->addAttribute('Selected', 'False');
    }

    private function simplexml_insert_after($insert, $target) {
        $target_dom = dom_import_simplexml($target);
        //print_r($target_dom); die;
        $insert_dom = $target_dom->ownerDocument->importNode(dom_import_simplexml($insert), true);
        if ($target_dom->nextSibling) {
            return $target_dom->parentNode->insertBefore($insert_dom, $target_dom->nextSibling);
        } else {
            return $target_dom->parentNode->appendChild($insert_dom);
        }
    }

    private function simplexml_insert_firstChild($insert, $target) {
        $target_dom = dom_import_simplexml($target);
        $insert_dom = $target_dom->ownerDocument->importNode(dom_import_simplexml($insert), true);
        return $target_dom->insertBefore($insert_dom, $target_dom->firstChild);
    }

    private function simplexml_append_child($insert, $target) {
        $target_dom = dom_import_simplexml($target);
        $insert_dom = $target_dom->ownerDocument->importNode(dom_import_simplexml($insert), true);
        return $target_dom->parentNode->appendChild($insert_dom);
    }

    public function actionCheckfile() {
        $all_files = $this->getAllMCHFiles();
        print_r($all_files);
        die;
    }

    public function actionInsertnewfield() {
        //$xpath = "/FIELDS/GROUP/PANELBODY/FIELD[@id='name']";
        $xpath = "/FIELDS/GROUP/PANELBODY//FIELD[@id='information_adequacy']";
        $insert = '<FIELD id="informant_notes" header2Class="Informant" type="TextArea" label="Notes">
                <PROPERTIES>
                    <PROPERTY name="id">informant_notes</PROPERTY>
                    <PROPERTY name="name">informant_notes</PROPERTY>
                    <PROPERTY name="class">form-control</PROPERTY>
                    <PROPERTY name="placeholder">Notes</PROPERTY>
                </PROPERTIES>
            </FIELD>';


        $all_files = $this->getAllFiles();
        $error_files = [];
        if (!empty($all_files)) {
            //echo 'dasd'; die;
            foreach ($all_files as $key => $files) {
                if (filesize($files) > 0) {
                    libxml_use_internal_errors(true);
                    $xml = simplexml_load_file($files, null, LIBXML_NOERROR);
                    if ($xml === false) {
                        $error_files[$key]['name'] = $files;
                        $error_files[$key]['error'] = libxml_get_errors();
                        continue;
                    }
                    $targets = $xml->xpath($xpath);
                    if (!empty($targets)) {
                        //print_r($targets); //echo $insert; die;
                        //$movie = $targets[0]->addChild($insert);
                        //$movie->addChild('title', 'PHP2: More Parser Stories');
                        //$this->simplexml_insert_firstChild(simplexml_load_string($insert), $targets[0]);
                        $this->simplexml_append_child(simplexml_load_string($insert), $targets[0]);
                    }
                    $xml->asXML($files);
                }
            }
        }
        echo "<pre>";
        print_r($error_files);
        exit;
    }

    public function actionSetattrvalue() {
        $node = 'FIELD';
        $attr = 'id';
        $find = 'ddl_pb_substance';
        //$replace = 'Higher_Mental_Functions';
//        $node = 'LISTITEM';
//        $attr = 'value';
//        $find = 'RTA &amp; Surgery';
//        $replace = 'RTA & Surgery';
        $xpath = "/FIELDS/GROUP/PANELBODY//{$node}[@{$attr}='{$find}']";
        //echo $xpath; die;

        $all_files = $this->getAllFiles();
        $error_files = [];
        if (!empty($all_files)) {
            //echo 'ddad'; die;
            foreach ($all_files as $key => $files) {
                if (filesize($files) > 0) {
                    libxml_use_internal_errors(true);
                    $xml = simplexml_load_file($files, null, LIBXML_NOERROR);
                    if ($xml === false) {
                        $error_files[$key]['name'] = $files;
                        $error_files[$key]['error'] = libxml_get_errors();
                        continue;
                    }
                    $targets = $xml->xpath($xpath);
                    if (!empty($targets)) {
                        foreach ($targets as $target) {
                            $target['type'] = 'DropDowntextbox';
                            $target->addAttribute('Backcontrols', 'hide');
                            $target->addAttribute('Backdivid', 'subtextboxDiv');
                            $property22 = $target->PROPERTIES->addChild('PROPERTY', "OThersDDtextvisible(this.id,this.value,'subtextboxDiv','block')");
                            $property22->addAttribute('name', 'onchange');
                        }
                    }
                    $xml->asXML($files);
                }
            }
        }
        echo "<pre>";
        print_r($error_files);
        exit;
    }

    //2. Section of past medical history Can we add RTA & Surgery (earlier suggested by Gopi Sir)  - COMPLETED
    public function actionInsertnewnode() {
        $field_type = 'CheckBoxList';
        if ($field_type == 'DropDownList') {
            $find_val = 'Ayurveda';
            $item = 'Yoga/Naturopathy';
            $value = 'Yoga/Naturopathy';
            $xpath = "/FIELDS/GROUP/PANELBODY//LISTITEM[@value='{$find_val}']/parent::LISTITEMS";
        } else if ($field_type == 'RadioButtonList') {
            $find_val = 'CBstreamform11';
            $item = 'Others';
            $value = 'Others';
            $id = 'CBstreamform12';
            $xpath = "/FIELDS/GROUP/PANELBODY//LISTITEM[@id='{$find_val}']/parent::LISTITEMS";
        } else if ($field_type == 'CheckBoxList') {
            $find_val = 'family_histroy8';
            $item = 'Others';
            $value = 'Others';
            $id = 'family_histroy9';
            $xpath = "/FIELDS/GROUP/PANELBODY//LISTITEM[@id='{$find_val}']/parent::LISTITEMS";
        }

        $all_files = $this->getAllMCHFiles();
        $error_files = [];
        if (!empty($all_files)) {
            foreach ($all_files as $key => $files) {
                if (filesize($files) > 0) {
                    libxml_use_internal_errors(true);
                    $xml = simplexml_load_file($files, null, LIBXML_NOERROR);
                    if ($xml === false) {
                        $error_files[$key]['name'] = $files;
                        $error_files[$key]['error'] = libxml_get_errors();
                        continue;
                    }
                    $targets = $xml->xpath($xpath);
                    if (!empty($targets)) {
                        foreach ($targets as $target) {
                            $target_array = (array) $target;
                            if (!in_array($value, $target_array['LISTITEM'])) {
                                if ($field_type == 'DropDownList') {
                                    $this->createDDLItem($target, $item, $value);
                                } else if ($field_type == 'RadioButtonList') {
                                    $this->createRadioButton($target, $item, $value, $id);
                                } else if ($field_type == 'CheckBoxList') {
                                    $this->createCheckBox($target, $item, $value, $id);
                                }
                            }
                        }
                    }
                    
                    $xml->asXML($files);
                    //print_r($targets); die;
                }
            }
        }
        echo "<pre>";
        print_r($error_files);
        exit;
    }

    //3. Section of treatment history's table - it's showing currently under treatment in 3rd column Pls consider it as Treatment Response
    public function actionChangetext() {
        $find = 'Notes';
        $replace = 'Past Medical Notes';
        //$xpath = "/FIELDS/GROUP/PANELBODY//FIELD[@type='RadGrid' and @ADDButtonID='RGPhamacoadd']/HEADER/TH[3]";
        //$xpath = "/FIELDS/GROUP/PANELHEADER";
        $xpath = "/FIELDS/GROUP/PANELBODY//FIELD[@id='past_medical_notes']";

        $all_files = $this->getAllMCHFiles();
        $error_files = [];
        if (!empty($all_files)) {
            foreach ($all_files as $key => $files) {
                if (filesize($files) > 0) {
                    libxml_use_internal_errors(true);
                    $xml = simplexml_load_file($files, null, LIBXML_NOERROR);
                    if ($xml === false) {
                        $error_files[$key]['name'] = $files;
                        $error_files[$key]['error'] = libxml_get_errors();
                        continue;
                    }
                    $targets = $xml->xpath($xpath);
                    if (!empty($targets)) {
                        if ($targets[0]['label'] == $find) {
                            $targets[0]['label'] = $replace;
                        }
                    }
                    $xml->asXML($files);
                }
            }
        }
        echo "<pre>";
        print_r($error_files);
        exit;
    }

    //3. Side effects - Changes
    public function actionSideeffects() {
        $xpath = "/FIELDS/GROUP/PANELBODY//FIELD[@type='RadGrid' and @ADDButtonID='RGPhamacoadd']//FIELD[@type='RadioButtonList']/FIELD[@type='TextBox']";
        $list_items = ['slurred speech', 'blurred vision', 'drowsiness', 'extra pyramidal symptoms', 'increased salivation', 'dysphagia', 'obesity', 'milk secretion', 'constipation', 'hand tremors', 'sexual dysfunction', 'menstrual problems', 'motor restlessness'];

        $all_files = $this->getAllFiles();
        $error_files = [];
        if (!empty($all_files)) {
            foreach ($all_files as $key => $files) {
                if (filesize($files) > 0) {
                    libxml_use_internal_errors(true);
                    $xml = simplexml_load_file($files, null, LIBXML_NOERROR);
                    if ($xml === false) {
                        $error_files[$key]['name'] = $files;
                        $error_files[$key]['error'] = libxml_get_errors();
                        continue;
                    }
                    $targets = $xml->xpath($xpath);
                    if (!empty($targets)) {
                        foreach ($targets as $target) {
                            unset($target['label']);
                            $target['type'] = 'DropDownList';
                            if ($target->PROPERTIES->PROPERTY[3]['name'] == 'placeholder') {
                                unset($target->PROPERTIES->PROPERTY[3]);
                            }

                            $listItems = $target->addChild('LISTITEMS');
                            foreach ($list_items as $itemkey => $value) {
                                $item_{$itemkey} = $listItems->addChild('LISTITEM', $value);
                                $item_{$itemkey}->addAttribute('value', $value);
                                $item_{$itemkey}->addAttribute('Selected', "False");
                            }
                        }
                    }
                    $xml->asXML($files);
                }
            }
        }
        echo "<pre>";
        print_r($error_files);
        exit;
    }

    public function actionRbtocb() {
        $xpath = "/FIELDS/GROUP/PANELBODY//FIELD[@type='TextBoxDDL' and @id='duration_of_relationship']";
        //$xpath = "/FIELDS/GROUP/PANELBODY//FIELD[@type='TextBoxDDL' and @id='total_duration']";

        $all_files = $this->getAllFiles();
        $error_files = [];
        if (!empty($all_files)) {
            foreach ($all_files as $key => $files) {
                if (filesize($files) > 0) {
                    libxml_use_internal_errors(true);
                    $xml = simplexml_load_file($files, null, LIBXML_NOERROR);
                    if ($xml === false) {
                        $error_files[$key]['name'] = $files;
                        $error_files[$key]['error'] = libxml_get_errors();
                        continue;
                    }
                    $targets = $xml->xpath($xpath);
                    if (!empty($targets)) {
                        foreach ($targets as $target) {
                            $target->PROPERTIES->PROPERTY[3] = 'return isNumericDotKeyStroke(event)';
                        }
                    }
                    $xml->asXML($files);
                }
            }
        }
        echo "<pre>";
        print_r($error_files);
        exit;
    }

    public function actionLiaddsetattr() {
        $xpath = "/FIELDS/GROUP/PANELBODY//FIELD[@id='martial_status' and @type='RadioButtonList']";

        $all_files = $this->getAllFiles();
        $error_files = [];
        if (!empty($all_files)) {
            foreach ($all_files as $key => $files) {
                if (filesize($files) > 0) {
                    libxml_use_internal_errors(true);
                    $xml = simplexml_load_file($files, null, LIBXML_NOERROR);
                    if ($xml === false) {
                        $error_files[$key]['name'] = $files;
                        $error_files[$key]['error'] = libxml_get_errors();
                        continue;
                    }
                    $targets = $xml->xpath($xpath);
                    if (!empty($targets)) {
                        //print_r($targets);
                        foreach ($targets as $target) {
                            foreach ($target->LISTITEMS->LISTITEM as $list_item) {
                                if (isset($list_item['onclick'])) {
                                    unset($list_item['onclick']);
                                }
                                if ($list_item['value'] == 'Un Married') {
                                    $list_item['id'] = 'RBMartial1';
                                }
                                if ($list_item['value'] == 'Widow') {
                                    $list_item['id'] = 'RBMartial5';
                                }
                                $list_item->addAttribute('onclick', "OThersvisible(this.id, 'maritalnote_div');");
                            }
                        }
                        // print_r($targets);
                    }
                    $xml->asXML($files);
                    //die;
                }
            }
        }
        echo "<pre>";
        print_r($error_files);
        exit;
    }

    public function actionChangetxtattrval() {
        //$xpath = "/FIELDS/GROUP/PANELBODY//LISTITEM[@id='RBnatureofdelusion2']";
        //$xpath = "/FIELDS/GROUP/PANELBODY/FIELD/LISTITEMS/LISTITEM[@value='Other']";
        //$xpath = "/FIELDS/GROUP/PANELBODY//FIELD/LISTITEMS/LISTITEM[@id='RBgaitdisurbances3']";
        $xpath = "/FIELDS/GROUP/PANELBODY/FIELD[@id='DDLpredisposing_factor']";

        $all_files = $this->getAllFiles();
        $error_files = [];
        if (!empty($all_files)) {
            foreach ($all_files as $key => $files) {
                if (filesize($files) > 0) {
                    libxml_use_internal_errors(true);
                    $xml = simplexml_load_file($files, null, LIBXML_NOERROR);
                    if ($xml === false) {
                        $error_files[$key]['name'] = $files;
                        $error_files[$key]['error'] = libxml_get_errors();
                        continue;
                    }
                    $targets = $xml->xpath($xpath);
                    if (!empty($targets)) {
                        foreach ($targets as $target) {
                            $target['header2Class'] = '';
                        }
                    }
                    $xml->asXML($files);
                }
            }
        }
        echo "<pre>";
        print_r($error_files);
        exit;
    }

    public function actionRbtoddl() {
        $xpath = "/FIELDS/GROUP/PANELBODY//FIELD[@type='RadioButtonList' and @id='primary_care_giver']";
        $field_property = [
            'id' => 'primary_care_giver',
            'name' => 'primary_care_giver',
            'class' => 'form-control'
        ];
        $list_items = ['Self', 'Father', 'Mother', 'Sibling', 'Spouse', 'Children', 'Friend', 'Others'];

        $all_files = $this->getAllFiles();
        $error_files = [];
        if (!empty($all_files)) {
            foreach ($all_files as $key => $files) {
                if (filesize($files) > 0) {
                    libxml_use_internal_errors(true);
                    $xml = simplexml_load_file($files, null, LIBXML_NOERROR);
                    if ($xml === false) {
                        $error_files[$key]['name'] = $files;
                        $error_files[$key]['error'] = libxml_get_errors();
                        continue;
                    }
                    $targets = $xml->xpath($xpath);
                    if (!empty($targets)) {
                        foreach ($targets as $target) {
                            $target['type'] = 'DropDownList';

                            unset($target->PROPERTIES);
                            $properties = $target->addChild('PROPERTIES');
                            foreach ($field_property as $key => $value) {
                                $property_{$key} = $properties->addChild("PROPERTY", $value);
                                $property_{$key}->addAttribute('name', $key);
                            }

                            unset($target->LISTITEMS);
                            $listItems = $target->addChild('LISTITEMS');
                            foreach ($list_items as $key => $value) {
                                $item_{$key} = $listItems->addChild('LISTITEM', $value);
                                $item_{$key}->addAttribute('value', $value);
                                $item_{$key}->addAttribute('Selected', ($key == 0 ? "True" : "False"));
                            }
                        }
                    }
                    $xml->asXML($files);
                }
            }
        }
        echo "<pre>";
        print_r($error_files);
        exit;
    }

    public function actionTextareafulltotextarea() {
        $xpath = "/FIELDS/GROUP/PANELBODY//FIELD[@type='textareaFull']";

        $all_files = $this->getAllFiles();
        $error_files = [];
        if (!empty($all_files)) {
            foreach ($all_files as $key => $files) {
                if (filesize($files) > 0) {
                    libxml_use_internal_errors(true);
                    $xml = simplexml_load_file($files, null, LIBXML_NOERROR);
                    if ($xml === false) {
                        $error_files[$key]['name'] = $files;
                        $error_files[$key]['error'] = libxml_get_errors();
                        continue;
                    }
                    $targets = $xml->xpath($xpath);
                    if (!empty($targets)) {
                        foreach ($targets as $target) {
                            if ($target['id'] == 'history_presenting_illness') {
                                continue;
                            }
                            $target['type'] = 'TextArea';
                            foreach ($target->PROPERTIES->PROPERTY as $property) {
                                if ($property['name'] == 'class') {
                                    $property[0] = 'form-control';
                                }

                                if ($property['name'] == 'rows') {
                                    $property['name'] = 'placeholder';
                                    $property[0] = 'Notes';
                                }
                            }
                        }
                    }
                    $xml->asXML($files);
                }
            }
        }
        echo "<pre>";
        print_r($error_files);
        exit;
    }

    public function actionDeletefield() {
        //$xpath = "/FIELDS/GROUP/PANELBODY//FIELD[@type='RadGrid' and @ADDButtonID='RGCompliantadd']//FIELD[@type='TextBoxDDL']";
        $xpath = "/FIELDS/GROUP/PANELBODY//FIELD/FIELD[@id='RBJudgementsocial']";

        $all_files = $this->getAllFiles();
        $error_files = [];
        if (!empty($all_files)) {
            foreach ($all_files as $key => $files) {
                if (filesize($files) > 0) {
                    libxml_use_internal_errors(true);
                    $xml = simplexml_load_file($files, null, LIBXML_NOERROR);
                    if ($xml === false) {
                        $error_files[$key]['name'] = $files;
                        $error_files[$key]['error'] = libxml_get_errors();
                        continue;
                    }
                    $targets = $xml->xpath($xpath);
                    if (!empty($targets)) {
                        foreach ($targets as $target) {
                            $dom = dom_import_simplexml($target);
                            $dom->parentNode->removeChild($dom);
                        }
                    }
                    $xml->asXML($files);
                } //die;
            }
        }
        echo "<pre>";
        print_r($error_files);
        exit;
    }

    public function actionDeleteth() {
        $xpath = "/FIELDS/GROUP/PANELBODY//FIELD[@type='RadGrid' and @ADDButtonID='RGCompliantadd']/HEADER";

        $all_files = $this->getAllFiles();
        $error_files = [];
        if (!empty($all_files)) {
            foreach ($all_files as $key => $files) {
                if (filesize($files) > 0) {
                    libxml_use_internal_errors(true);
                    $xml = simplexml_load_file($files, null, LIBXML_NOERROR);
                    if ($xml === false) {
                        $error_files[$key]['name'] = $files;
                        $error_files[$key]['error'] = libxml_get_errors();
                        continue;
                    }
                    $targets = $xml->xpath($xpath);
                    if (!empty($targets)) {
                        foreach ($targets as $target) {
                            if (isset($target->TH[1])) {
                                unset($target->TH[1]);
                            }
                        }
                    }
                    $xml->asXML($files);
                }
            }
        }
        echo "<pre>";
        print_r($error_files);
        exit;
    }

    public function actionDeleteli() {
        //$xpath = "/FIELDS/GROUP/PANELBODY//FIELD[@id='martial_status']/LISTITEMS";
        $xpath = "/FIELDS/GROUP/PANELBODY/FIELD/FIELD/FIELD/FIELD[@id='CBreasonforchange']/LISTITEMS";

        $all_files = $this->getAllFiles();
        $error_files = [];
        if (!empty($all_files)) {
            foreach ($all_files as $key => $files) {
                if (filesize($files) > 0) {
                    libxml_use_internal_errors(true);
                    $xml = simplexml_load_file($files, null, LIBXML_NOERROR);
                    if ($xml === false) {
                        $error_files[$key]['name'] = $files;
                        $error_files[$key]['error'] = libxml_get_errors();
                        continue;
                    }
                    $targets = $xml->xpath($xpath);
                    if (!empty($targets)) {
                        foreach ($targets as $target) {
                            if (isset($target->LISTITEM[1])) {
                                unset($target->LISTITEM[1]);
                            }
                        }
                    }
                    $xml->asXML($files); //die;
                }
            }
        }
        echo "<pre>";
        print_r($error_files);
        exit;
    }

    public function actionUpdatedb() {
        $all_files = $this->getAllXmlXsltFiles();
        if (!empty($all_files)) {
            foreach ($all_files as $key => $files) {
                if (filesize($files) > 0) {

                    $fileContent = file_get_contents($files);
                    //PatDocumentTypes::updateAllCounters(["document_xml" => $fileContent]);
                    $docModel = PatDocumentTypes::find()->andWhere(['doc_type' => 'CH'])
                            //->where(['IN', 'tenant_id', [1, 2, 3, 4]]) //1st set
                            //->where(['IN', 'tenant_id', [6, 7, 11, 13]]) //2nd set 
                            //->where(['IN', 'tenant_id', [12]])    //Medclinic tenant id
                            //->where(['IN', 'tenant_id', []])    //Msctrf tenant id
                            ->all();
                    foreach ($docModel as $doc) {
                        if (basename($files) == 'case_history.xml') {
                            $doc->document_xml = $fileContent;
                            $doc->save(false);
                        }
                        if (basename($files) == 'case_history.xslt') {
                            $doc->document_xslt = $fileContent;
                            $doc->save(false);
                        }
                        if (basename($files) == 'case_history_out.xslt') {
                            $doc->document_out_xslt = $fileContent;
                            $doc->save(false);
                        }
                        if (basename($files) == 'case_history_out_print.xslt') {
                            $doc->document_out_print_xslt = $fileContent;
                            $doc->save(false);
                        }
                    }
                }
            }
        }
        exit;
    }

    public function actionMchupdatedb() {
        $all_files = $this->getAllXmlXsltFiles();
        if (!empty($all_files)) {
            foreach ($all_files as $key => $files) {
                if (filesize($files) > 0) {

                    $fileContent = file_get_contents($files);
                    //PatDocumentTypes::updateAllCounters(["document_xml" => $fileContent]);
                    $docModel = PatDocumentTypes::find()->andWhere(['doc_type' => 'MCH'])->all();
                    foreach ($docModel as $doc) {
                        if (basename($files) == 'medical_case_history.xml') {
                            $doc->document_xml = $fileContent;
                            $doc->save(false);
                        }
                        if (basename($files) == 'medical_case_history.xslt') {
                            $doc->document_xslt = $fileContent;
                            $doc->save(false);
                        }
                        if (basename($files) == 'medical_case_history_out.xslt') {
                            $doc->document_out_xslt = $fileContent;
                            $doc->save(false);
                        }
                        if (basename($files) == 'medical_casehistory_out_print.xslt') {
                            $doc->document_out_print_xslt = $fileContent;
                            $doc->save(false);
                        }
                    }
                }
            }
        }
        exit;
    }

    public function actionRadgrid() {
        $xpath = "/FIELDS/GROUP/PANELBODY//FIELD[@type='RadGrid' and @ADDButtonID='RGCompliantadd']/COLUMNS";

        $all_files = $this->getAllFiles();
        $error_files = [];
        if (!empty($all_files)) {
            foreach ($all_files as $key => $files) {
                if (filesize($files) > 0) {
                    libxml_use_internal_errors(true);
                    $xml = simplexml_load_file($files, null, LIBXML_NOERROR);
                    if ($xml === false) {
                        $error_files[$key]['name'] = $files;
                        $error_files[$key]['error'] = libxml_get_errors();
                        continue;
                    }

                    $targets = $xml->xpath($xpath);
                    $no_of_targets = count($targets);
                    if ($no_of_targets >= 5) {
                        continue;
                    }

                    if (!empty($targets)) {
                        $max = 5;
                        for ($i = $no_of_targets; $i < $max; $i++) {
                            $insert = "<COLUMNS><FIELD id='txtComplaints{$i}' type='TextBox'>
                                            <PROPERTIES>
                                                <PROPERTY name='id'>txtComplaints{$i}</PROPERTY>
                                                <PROPERTY name='name'>txtComplaints{$i}</PROPERTY>
                                                <PROPERTY name='class'>form-control</PROPERTY>
                                            </PROPERTIES>
                                        </FIELD></COLUMNS>";
                            $this->simplexml_append_child(simplexml_load_string($insert), $targets[0]);
                        }
                    }
                    $xml->asXML($files);
                }
            }
        }
        echo "<pre>";
        print_r($error_files);
        exit;
    }

    public function actionMoveitems() {
        $xpath = "/FIELDS/GROUP/PANELBODY/FIELD/FIELD/FIELD[@id='RBorientationSexual']/LISTITEMS";
        $insert = "<LISTITEM value='Same Sex' id='RBorientationSexual1' Selected='False'>Same Sex</LISTITEM>";
        $all_files = $this->getAllFiles();
        $error_files = [];

        if (!empty($all_files)) {
            foreach ($all_files as $key => $files) {
                if (!empty($all_files)) {
                    foreach ($all_files as $key => $files) {
                        if (filesize($files) > 0) {
                            libxml_use_internal_errors(true);
                            $xml = simplexml_load_file($files, null, LIBXML_NOERROR);
                            if ($xml === false) {
                                $error_files[$key]['name'] = $files;
                                $error_files[$key]['error'] = libxml_get_errors();
                                continue;
                            }
                            $targets = $xml->xpath($xpath);
                            if (!empty($targets)) {
                                foreach ($targets as $target) {
                                    $this->simplexml_append_child(simplexml_load_string($insert), $target->LISTITEM[1]);
                                    unset($target->LISTITEM[0]);
                                }
                            }
                            $xml->asXML($files);
                        }
                    }
                }
                echo "<pre>";
                print_r($error_files);
                exit;
            }
        }
    }

    public function actionChangethvalue() {
        $xpath = "/FIELDS/GROUP/PANELBODY//FIELD[@type='RadGrid' and @ADDButtonID='RGprevprescriptionadd']/HEADER";
        $insert = 'Response';

        $all_files = $this->getAllMCHFiles();
        $error_files = [];
        if (!empty($all_files)) {
            foreach ($all_files as $key => $files) {
                if (filesize($files) > 0) {
                    libxml_use_internal_errors(true);
                    $xml = simplexml_load_file($files, null, LIBXML_NOERROR);
                    if ($xml === false) {
                        $error_files[$key]['name'] = $files;
                        $error_files[$key]['error'] = libxml_get_errors();
                        continue;
                    }
                    $targets = $xml->xpath($xpath);
                    if (!empty($targets)) {
                        foreach ($targets as $target) {
                            print_r($files);
//                            if ((isset($target->TH[0])) && (isset($target->TH[1]))) {
//                                if ($target->TH[0] != 'Pres Date') {
//                                    $target->TH[0] = 'Pres Date';
//                                    $target->TH[1] = 'Product Name';
//                                }
//                            }
                            if ((isset($target->TH[2])) && (isset($target->TH[3])) && (isset($target->TH[4]))) {
                                if ($target->TH[2] == 'Generic Name') {
                                    unset($target->TH[2]);
                                }
                                if ($target->TH[2] == 'Drug Name') {
                                    unset($target->TH[2]);
                                }
                                if ($target->TH[2] == 'Route') {
                                    unset($target->TH[2]);
                                }
                            }
                            print_r($target); //die;
//                            if ((isset($target->TH[1])) && (isset($target->TH[2]))) {
//                                $target->TH[1] = $target->TH[2];
//                                $target->TH[2] = $insert;
//                            }
                        }
                    } //print_r($target); die;
                    $xml->asXML($files);
                } //die;
            }
        }
        echo "<pre>";
        print_r($error_files);
        exit;
    }

    public function actionChangefieldvalue() {
//        $insertpath = "/FIELDS/GROUP/PANELBODY/FIELD/FIELD[@id='diagnosis_notes']";
//        $xpath = "/FIELDS/GROUP/PANELBODY/FIELD/FIELD[@id='txtAxis5']";

        $insertpath = "/FIELDS/GROUP/PANELBODY/FIELD/FIELD[@id='RBrapport']";
        $xpath = "/FIELDS/GROUP/PANELBODY/FIELD/FIELD[@id='RBeyetoeyecontact']";

//        $webroot = Yii::getAlias('@webroot');
//        $files = FileHelper::findFiles($webroot . '/uploads', [
//                    'only' => ['CH_8666_1499335581.xml'],
//                    'recursive' => true,
//        ]);
//        $base_xml = [realpath(dirname(__FILE__) . '/../../../../IRISADMIN/web/case_history.xml')];
//        $all_files = \yii\helpers\ArrayHelper::merge($base_xml, $files);

        $all_files = $this->getAllFiles();

        $error_files = [];
        if (!empty($all_files)) {
            foreach ($all_files as $key => $files) {
                if (filesize($files) > 0) {
                    libxml_use_internal_errors(true);
                    $xml = simplexml_load_file($files, null, LIBXML_NOERROR);
                    if ($xml === false) {
                        $error_files[$key]['name'] = $files;
                        $error_files[$key]['error'] = libxml_get_errors();
                        continue;
                    }
                    $inserts = $xml->xpath($insertpath);
                    $targets = $xml->xpath($xpath);
                    if (!empty($targets)) {
                        foreach ($targets as $target) {
                            foreach ($inserts as $insert) {
                                //print_r($target); print_r($insert);
                                $doc = new \DOMDocument();
                                $doc->loadXML($insert->asXML());
                                $insert_xml = $doc->saveXML();
                                $insert_xml = preg_replace('/^.+\n/', '', $insert_xml);
                                //print_r($insert_xml);
                                //print_r($targets[0]);
                                $this->simplexml_insert_after(simplexml_load_string($insert_xml), $targets[0]);
                                //$dom = dom_import_simplexml($target);
                                //$dom->parentNode->removeChild($dom);
                            }
                        }
                    }
                    $xml->asXML($files);
                } //die;
            }
        }
        echo "<pre>";
        print_r($error_files);
        exit;
    }

    public function actionRemoveduplicatefield() {
        $xpath = "/FIELDS/GROUP/PANELBODY/FIELD/FIELD[@id='RBrapport']";

//        $webroot = Yii::getAlias('@webroot');
//        $files = FileHelper::findFiles($webroot . '/uploads', [
//                    'only' => ['CH_8666_1499335581.xml'],
//                    'recursive' => true,
//        ]);
//        $base_xml = [realpath(dirname(__FILE__) . '/../../../../IRISADMIN/web/case_history.xml')];
//        $all_files = \yii\helpers\ArrayHelper::merge($base_xml, $files);
        $all_files = $this->getAllFiles();

        $error_files = [];
        if (!empty($all_files)) {
            //echo 'asda'; die;
            foreach ($all_files as $key => $files) {
                if (filesize($files) > 0) {
                    libxml_use_internal_errors(true);
                    $xml = simplexml_load_file($files, null, LIBXML_NOERROR);
                    if ($xml === false) {
                        $error_files[$key]['name'] = $files;
                        $error_files[$key]['error'] = libxml_get_errors();
                        continue;
                    }
                    $targets = $xml->xpath($xpath);
                    if (!empty($targets)) {
                        $first = true;
                        foreach ($targets as $target) {
                            //print_r($target); die;
                            if (!$first) {
                                $dom = dom_import_simplexml($target);
                                $dom->parentNode->removeChild($dom);
                            }
                            $first = false;
                        }
                    }
                    $xml->asXML($files);
                } //die;
            }
        }
        echo "<pre>";
        print_r($error_files);
        exit;
    }

    public function actionChangecapitalletter() {
        $xpath = "/FIELDS/GROUP/PANELBODY//FIELD/LISTITEMS/LISTITEM";
        $all_files = $this->getAllFiles();
        $error_files = [];
        if (!empty($all_files)) {
            foreach ($all_files as $key => $files) {
                if (filesize($files) > 0) {
                    libxml_use_internal_errors(true);
                    $xml = simplexml_load_file($files, null, LIBXML_NOERROR);
                    if ($xml === false) {
                        $error_files[$key]['name'] = $files;
                        $error_files[$key]['error'] = libxml_get_errors();
                        continue;
                    }
                    $targets = $xml->xpath($xpath);
                    if (!empty($targets)) {
                        foreach ($targets as $target) {
                            $target['value'] = ucwords($target['value']);
                            $target[0] = ucwords($target[0]);
                        }
                    }
                    $xml->asXML($files);
                }
            }
        }
    }

    public function actionRadgridcolumncount() {
        $xpath = "/FIELDS/GROUP/PANELBODY//FIELD/FIELD[@ADDButtonID='RGPhamacoadd']/COLUMNS";
        $all_files = $this->getAllFiles();
        $error_files = [];
        if (!empty($all_files)) {
            foreach ($all_files as $key => $files) {
                if (filesize($files) > 0) {
                    libxml_use_internal_errors(true);
                    $xml = simplexml_load_file($files, null, LIBXML_NOERROR);
                    if ($xml === false) {
                        $error_files[$key]['name'] = $files;
                        $error_files[$key]['error'] = libxml_get_errors();
                        continue;
                    }
                    $targets = $xml->xpath($xpath);
                    if (!empty($targets)) {
                        $count = count($targets);
                        if ($count > 1) {
                            echo $files;
                            echo '----';
                            echo $count;
                            echo "\n";
                        }
                    }
                    //$xml->asXML($files);
                }
            }
        }
        echo "<pre>";
        print_r($error_files);
        exit;
    }

    public function actionRadgridcolumnupdate() {
        $xpath = "/FIELDS/GROUP/PANELBODY//FIELD/FIELD[@ADDButtonID='RGPhamacoadd']//COLUMNS/FIELD[4]";

        $all_files = $this->getAllFiles();
        $error_files = [];
        if (!empty($all_files)) {
            foreach ($all_files as $key => $files) {
                if (filesize($files) > 0) {
                    libxml_use_internal_errors(true);
                    $xml = simplexml_load_file($files, null, LIBXML_NOERROR);
                    if ($xml === false) {
                        $error_files[$key]['name'] = $files;
                        $error_files[$key]['error'] = libxml_get_errors();
                        continue;
                    }
                    $targets = $xml->xpath($xpath);
                    if (!empty($targets)) {
                        foreach ($targets as $key => $value) {
                            if ($key == '0') {
                                $insert = '<FIELD id="txtPhamacoSideEffectsTextbox" type="TextBox" texttypeid="selectdropdown">
                                <PROPERTIES>
                                    <PROPERTY name="id">txtPhamacoSideEffectsTextbox</PROPERTY>
                                    <PROPERTY name="name">txtPhamacoSideEffectsTextbox</PROPERTY>
                                    <PROPERTY name="class">form-control</PROPERTY>
                                </PROPERTIES>
                            </FIELD>';
                            } else {
                                $insert = '<FIELD id="txtPhamacoSideEffectsTextbox' . $key . '" type="TextBox" texttypeid="selectdropdown">
                                <PROPERTIES>
                                    <PROPERTY name="id">txtPhamacoSideEffectsTextbox' . $key . '</PROPERTY>
                                    <PROPERTY name="name">txtPhamacoSideEffectsTextbox' . $key . '</PROPERTY>
                                    <PROPERTY name="class">form-control</PROPERTY>
                                </PROPERTIES>
                            </FIELD>';
                            }
                            $this->simplexml_insert_firstChild(simplexml_load_string($insert), $targets[$key]);
                            if (!empty($value->FIELD[1]->PROPERTIES->PROPERTY[0])) {
                                if ($value->FIELD[1]->PROPERTIES->PROPERTY[0] == 'txtPhamacoSideEffects' . $key . '') {
                                    $value->FIELD[1]->PROPERTIES->PROPERTY[1] = $value->FIELD[1]->PROPERTIES->PROPERTY[1] . '[]';
                                    $value->FIELD[1]['type'] = 'MultiDropDownList';
                                }
                            }
                        }
                    }
                    $xml->asXML($files);
                    //die;
                }
            }
        }
        echo "<pre>";
        print_r($error_files);
        exit;
    }

    public function actionCheckstring() {
        $all_files = $this->getAllFiles();
        $error_files = [];
        if (!empty($all_files)) {
            foreach ($all_files as $key => $files) {
                if (strpos(file_get_contents($files), 'Krishnaram') !== false) {
                    $error_files[$key]['name'] = $files;
                } else {
                    $else_files[$key]['name'] = $files;
                }
            }
        }
        echo "<pre>";
        print_r($error_files);
        exit;
    }

}
