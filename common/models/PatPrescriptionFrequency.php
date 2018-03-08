<?php

namespace common\models;

use common\models\query\PatPrescriptionFrequencyQuery;
use Yii;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "pat_prescription_frequency".
 *
 * @property integer $freq_id
 * @property integer $tenant_id
 * @property string $freq_name
 * @property string $freq_type
 * @property integer $consultant_id
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property CoTenant $tenant
 * @property PatPrescriptionItems[] $patPrescriptionItems
 */
class PatPrescriptionFrequency extends RActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pat_prescription_frequency';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['freq_name'], 'required'],
                [['tenant_id', 'created_by', 'modified_by'], 'integer'],
                [['status', 'product_type'], 'string'],
                [['created_at', 'modified_at', 'deleted_at'], 'safe'],
                [['freq_name'], 'string', 'max' => 20]
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'freq_id' => 'Freq ID',
            'tenant_id' => 'Tenant ID',
            'freq_name' => 'Freq Name',
            'product_type' => 'Product Type',
            'status' => 'Status',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
            'deleted_at' => 'Deleted At',
        ];
    }

    /**
     * @return ActiveQuery
     */
    public function getTenant() {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getPatPrescriptionItems() {
        return $this->hasMany(PatPrescriptionItems::className(), ['freq_id' => 'freq_id']);
    }

    public static function find() {
        return new PatPrescriptionFrequencyQuery(get_called_class());
    }

    public function fields() {
        $extend = [];

        $parent_fields = parent::fields();
        $addt_keys = [];
        if ($addtField = Yii::$app->request->get('addtfields')) {
            switch ($addtField):
                case 'pres_frequency':
                    $parent_fields = [
                        'freq_id' => 'freq_id',
                        'freq_name' => 'freq_name',
                        'product_type' => 'product_type',
                        'freq_type' => 'freq_type',
                    ];
                    break;
            endswitch;
        }

        $extFields = ($addt_keys) ? array_intersect_key($extend, array_flip($addt_keys)) : $extend;

        return array_merge($parent_fields, $extFields);
    }

    public static function getFrequencylist($tenant = null, $status = '1', $deleted = false) {
        if (!$deleted)
            $list = self::find()->tenant($tenant)->status($status)->active()->all();
        else
            $list = self::find()->tenant($tenant)->deleted()->all();

        return $list;
    }

}
