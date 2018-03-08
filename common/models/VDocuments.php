<?php

namespace common\models;

/**
 * This is the model class for table "v_documents".
 *
 * @property integer $doc_id
 * @property integer $encounter_id
 * @property string $doc_type
 * @property string $doc_name
 * @property string $date_time
 */
class VDocuments extends RActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'v_documents';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
            [['doc_id', 'encounter_id'], 'integer'],
            [['date_time'], 'safe'],
            [['doc_type'], 'string', 'max' => 50],
            [['doc_name'], 'string', 'max' => 255]
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'doc_id' => 'Doc ID',
            'encounter_id' => 'Encounter ID',
            'doc_type' => 'Doc Type',
            'doc_name' => 'Doc Name',
            'date_time' => 'Date Time',
        ];
    }

}
